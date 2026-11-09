import { Injectable, Logger } from '@nestjs/common';

import {
  type LanguageModelV4,
  type LanguageModelV4CallOptions,
  type LanguageModelV4FilePart,
  type LanguageModelV4Prompt,
  type LanguageModelV4TextPart,
  type LanguageModelV4Usage,
} from '@ai-sdk/provider';
import { validateDownloadUrl } from '@ai-sdk/provider-utils';
import { isArray, isNonEmptyString, isNull, isString } from '@sniptt/guards';
import {
  APICallError,
  type Experimental_DownloadFunction as DownloadFunction,
  type FilePart,
  type LanguageModel,
  type LanguageModelMiddleware,
  type ModelMessage,
  type TextPart,
  type UserContent,
  wrapLanguageModel,
} from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { AI_READABLE_FILE_FOLDERS } from 'src/engine/core-modules/tool/constants/ai-readable-file-folders.constant';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';
import { UNDELIVERED_FILE_REASON } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/undelivered-file-reason.constant';
import { type ModelFileLimits } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/model-file-limits.type';
import { getFilePartHttpUrl } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/get-file-part-http-url.util';
import { getModelFileLimits } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/get-model-file-limits.util';
import { insertModelInputFileMessages } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/insert-model-input-file-messages.util';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { type AiModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';
import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/types/model-id.type';
import { formatUnsupportedFilePlaceholder } from 'src/engine/metadata-modules/ai/ai-models/utils/format-unsupported-file-placeholder.util';
import { getNativeMimeTypesForModalities } from 'src/engine/metadata-modules/ai/ai-models/utils/get-native-mime-types-for-modalities.util';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

const FILE_REJECTION_STATUS_CODES = new Set([400, 413, 422]);
const PROMPT_TOO_LONG_ERROR_PATTERN =
  /context.length|prompt is too long|input is too long|maximum prompt length|maximum number of tokens/i;
const FILE_CHECK_PROMPT = 'Reply with OK.';
const FILE_CHECK_MAX_OUTPUT_TOKENS = 16;

type AgentFileDelivery = {
  model: LanguageModel;
  prepareFileParts: (messages: ModelMessage[]) => Promise<ModelMessage[]>;
  downloadFiles?: DownloadFunction;
};

type AgentFileBilling = {
  modelId: ModelId;
  workspaceId: string;
  operationType: UsageOperationType;
  spenders: UsageSpenders;
};

type AgentFileDeliveryState = AgentFileBilling & {
  canSendSignedUrls: boolean;
  areFilesRejected: boolean;
  nativeMimeTypes: Set<string>;
  limits: ModelFileLimits;
  filesByUrl: Map<string, Promise<FileEntity | null>>;
  bytesByFileId: Map<string, Promise<Buffer | null>>;
  fileIdsByBytes: Map<Uint8Array | string, string>;
  rejectedFileIds: Set<string>;
  fileRejectionsByBytes: Map<Uint8Array | string, boolean>;
};

type FilePartReplacement = LanguageModelV4FilePart | LanguageModelV4TextPart;

type FileCheckArguments = {
  params: LanguageModelV4CallOptions;
  model: LanguageModelV4;
  deliveryState: AgentFileDeliveryState;
};

type FilePartCheckArguments = FileCheckArguments & {
  part: LanguageModelV4FilePart;
};

type FileRetryArguments = FileCheckArguments & {
  fileRejection: APICallError;
};

type FileBudget = {
  remainingSizeBytes: number;
  remainingFileCount: number;
};

@Injectable()
export class AgentFilePartService {
  private readonly logger = new Logger(AgentFilePartService.name);

  constructor(
    private readonly fileUrlService: FileUrlService,
    private readonly fileService: FileService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly aiBillingService: AiBillingService,
  ) {}

  createFileDelivery({
    model,
    modelConfig,
    ...billing
  }: AgentFileBilling & {
    model: LanguageModel;
    modelConfig: Pick<AiModelConfig, 'sdkPackage' | 'modalities'>;
  }): AgentFileDelivery {
    if (isString(model)) {
      return { model, prepareFileParts: async (messages) => messages };
    }

    const deliveryState: AgentFileDeliveryState = {
      ...billing,
      canSendSignedUrls: this.canSendSignedUrls(),
      areFilesRejected: false,
      nativeMimeTypes: getNativeMimeTypesForModalities(modelConfig.modalities),
      limits: getModelFileLimits(modelConfig.sdkPackage),
      filesByUrl: new Map(),
      bytesByFileId: new Map(),
      fileIdsByBytes: new Map(),
      rejectedFileIds: new Set(),
      fileRejectionsByBytes: new Map(),
    };

    return {
      model: wrapLanguageModel({
        model,
        middleware: this.buildFileDeliveryMiddleware(deliveryState),
      }),
      prepareFileParts: (messages) =>
        this.prepareFileParts(messages, deliveryState),
      downloadFiles: (requestedFiles) =>
        this.downloadFiles(requestedFiles, deliveryState),
    };
  }

  private buildFileDeliveryMiddleware(
    deliveryState: AgentFileDeliveryState,
  ): LanguageModelMiddleware {
    return {
      specificationVersion: 'v4',
      transformParams: async ({ params }) => ({
        ...params,
        prompt: await this.replaceFileParts(params.prompt, (part) =>
          this.replaceUnreadableFilePart(part, deliveryState),
        ),
      }),
      wrapStream: async ({ doStream, params, model }) => {
        try {
          return await doStream();
        } catch (error) {
          if (!this.isFileRejectedByProvider(error, params.prompt)) {
            throw error;
          }

          const retryArguments = {
            fileRejection: error,
            params,
            model,
            deliveryState,
          };
          const hasFileUrl = this.getPromptFileParts(params.prompt).some(
            (part) => part.data.type === 'url',
          );

          return hasFileUrl && !this.isPromptTooLong(error)
            ? this.retryFileUrlsAsBytes(retryArguments)
            : this.retryWithoutRejectedFiles(retryArguments);
        }
      },
    };
  }

  private isFileRejectedByProvider(
    error: unknown,
    prompt: LanguageModelV4Prompt,
  ): error is APICallError {
    return (
      APICallError.isInstance(error) &&
      FILE_REJECTION_STATUS_CODES.has(error.statusCode ?? 0) &&
      this.getPromptFileParts(prompt).length > 0
    );
  }

  private isPromptTooLong({ message, responseBody }: APICallError): boolean {
    return PROMPT_TOO_LONG_ERROR_PATTERN.test(`${message} ${responseBody}`);
  }

  private getPromptFileParts(
    prompt: LanguageModelV4Prompt,
  ): LanguageModelV4FilePart[] {
    return prompt.flatMap((message) =>
      message.role === 'user'
        ? message.content.filter((part) => part.type === 'file')
        : [],
    );
  }

  private async replaceUnreadableFilePart(
    part: LanguageModelV4FilePart,
    deliveryState: AgentFileDeliveryState,
  ): Promise<FilePartReplacement> {
    if (part.data.type !== 'url') {
      return part;
    }

    const file = await this.loadFile(part.data.url.toString(), deliveryState);

    return !isDefined(file) ||
      isNull(await deliveryState.bytesByFileId.get(file.id))
      ? this.buildPlaceholder(part, UNDELIVERED_FILE_REASON.unavailable)
      : part;
  }

  private async retryFileUrlsAsBytes({
    fileRejection,
    params,
    model,
    deliveryState,
  }: FileRetryArguments) {
    this.logger.warn(
      `Provider refused a file link, retrying with bytes: ${fileRejection.message}`,
    );
    deliveryState.canSendSignedUrls = false;

    const paramsWithBytes = {
      ...params,
      prompt: await this.replaceFileParts(params.prompt, (part) =>
        this.replaceFileUrlWithBytes(part, deliveryState),
      ),
    };

    try {
      return await model.doStream(paramsWithBytes);
    } catch (bytesRejection) {
      if (
        !this.isFileRejectedByProvider(bytesRejection, paramsWithBytes.prompt)
      ) {
        throw bytesRejection;
      }

      return this.retryWithoutRejectedFiles({
        fileRejection: bytesRejection,
        params: paramsWithBytes,
        model,
        deliveryState,
      });
    }
  }

  private async retryWithoutRejectedFiles(retryArguments: FileRetryArguments) {
    const { fileRejection, params, model, deliveryState } = retryArguments;

    if (this.isPromptTooLong(fileRejection)) {
      return this.retryWithoutFiles(retryArguments);
    }

    this.logger.warn(
      `Provider refused a file, checking each file: ${fileRejection.message}`,
    );

    const rejectedFileParts = await this.findRejectedFileParts(retryArguments);

    if (rejectedFileParts.size === 0) {
      return this.retryWithoutFiles(retryArguments);
    }

    rejectedFileParts.forEach((part) =>
      this.rememberRejectedFile(part, deliveryState),
    );

    const paramsWithoutRejectedFiles = {
      ...params,
      prompt: await this.replaceFileParts(params.prompt, (part) =>
        rejectedFileParts.has(part)
          ? this.buildPlaceholder(part, UNDELIVERED_FILE_REASON.rejected)
          : part,
      ),
    };

    try {
      return await model.doStream(paramsWithoutRejectedFiles);
    } catch (remainingFilesRejection) {
      if (
        !this.isFileRejectedByProvider(
          remainingFilesRejection,
          paramsWithoutRejectedFiles.prompt,
        )
      ) {
        throw remainingFilesRejection;
      }

      return this.retryWithoutFiles({
        fileRejection: remainingFilesRejection,
        params: paramsWithoutRejectedFiles,
        model,
        deliveryState,
      });
    }
  }

  private async findRejectedFileParts({
    params,
    model,
    deliveryState,
  }: FileCheckArguments): Promise<Set<LanguageModelV4FilePart>> {
    const rejectedFileParts = new Set<LanguageModelV4FilePart>();

    for (const part of this.getPromptFileParts(params.prompt)) {
      if (
        await this.isFilePartRejected({ part, params, model, deliveryState })
      ) {
        rejectedFileParts.add(part);
      }
    }

    return rejectedFileParts;
  }

  private async isFilePartRejected(
    filePartCheck: FilePartCheckArguments,
  ): Promise<boolean> {
    const { part, deliveryState } = filePartCheck;

    if (part.data.type !== 'data') {
      return this.sendFilePartCheck(filePartCheck);
    }

    const fileBytes = part.data.data;
    const previousRejection =
      deliveryState.fileRejectionsByBytes.get(fileBytes);

    if (isDefined(previousRejection)) {
      return previousRejection;
    }

    const isRejected = await this.sendFilePartCheck(filePartCheck);

    deliveryState.fileRejectionsByBytes.set(fileBytes, isRejected);

    return isRejected;
  }

  private async sendFilePartCheck({
    part,
    params: { abortSignal, headers },
    model,
    deliveryState,
  }: FilePartCheckArguments): Promise<boolean> {
    const prompt: LanguageModelV4Prompt = [
      {
        role: 'user',
        content: [part, { type: 'text', text: FILE_CHECK_PROMPT }],
      },
    ];

    try {
      const { usage } = await model.doGenerate({
        prompt,
        maxOutputTokens: FILE_CHECK_MAX_OUTPUT_TOKENS,
        abortSignal,
        headers,
      });

      this.billFilePartCheck(usage, deliveryState);

      return false;
    } catch (error) {
      if (!this.isFileRejectedByProvider(error, prompt)) {
        throw error;
      }

      return true;
    }
  }

  private billFilePartCheck(
    usage: LanguageModelV4Usage,
    { modelId, workspaceId, operationType, spenders }: AgentFileDeliveryState,
  ): void {
    void this.aiBillingService
      .calculateAndBillUsage({
        modelId,
        billingInput: {
          usage: {
            inputTokens: usage.inputTokens.total,
            outputTokens: usage.outputTokens.total,
            inputTokenDetails: {
              cacheReadTokens: usage.inputTokens.cacheRead,
              cacheWriteTokens: usage.inputTokens.cacheWrite,
            },
            outputTokenDetails: {
              reasoningTokens: usage.outputTokens.reasoning,
            },
          },
        },
        workspaceId,
        operationType,
        spenders,
      })
      .catch((error: unknown) =>
        this.logger.error(
          `Could not bill a file check in workspace ${workspaceId}`,
          error instanceof Error ? error.stack : error,
        ),
      );
  }

  private rememberRejectedFile(
    part: LanguageModelV4FilePart,
    deliveryState: AgentFileDeliveryState,
  ): void {
    if (part.data.type !== 'data') {
      return;
    }

    const fileId = deliveryState.fileIdsByBytes.get(part.data.data);

    if (isDefined(fileId)) {
      deliveryState.rejectedFileIds.add(fileId);
    }
  }

  private async retryWithoutFiles({
    fileRejection,
    params,
    model,
    deliveryState,
  }: FileRetryArguments) {
    this.logger.warn(
      `Provider refused the files of this run: ${fileRejection.message}`,
    );

    const streamWithoutFiles = await model.doStream({
      ...params,
      prompt: await this.replaceFileParts(params.prompt, (part) =>
        this.buildPlaceholder(part, UNDELIVERED_FILE_REASON.rejected),
      ),
    });

    deliveryState.areFilesRejected = true;

    return streamWithoutFiles;
  }

  private replaceFileParts(
    prompt: LanguageModelV4Prompt,
    replaceFilePart: (
      part: LanguageModelV4FilePart,
    ) => FilePartReplacement | Promise<FilePartReplacement>,
  ): Promise<LanguageModelV4Prompt> {
    return Promise.all(
      prompt.map(async (message) => {
        if (message.role !== 'user') {
          return message;
        }

        return {
          ...message,
          content: await Promise.all(
            message.content.map((part) =>
              part.type === 'file' ? replaceFilePart(part) : part,
            ),
          ),
        };
      }),
    );
  }

  private async replaceFileUrlWithBytes(
    part: LanguageModelV4FilePart,
    deliveryState: AgentFileDeliveryState,
  ): Promise<FilePartReplacement> {
    if (part.data.type !== 'url') {
      return part;
    }

    const file = await this.loadFile(part.data.url.toString(), deliveryState);

    const bytes =
      isDefined(file) &&
      !deliveryState.limits.mimeTypesRequiringUrl.has(part.mediaType)
        ? await this.loadFileBytes(file, deliveryState)
        : null;

    return isDefined(bytes)
      ? { ...part, data: { type: 'data', data: bytes } }
      : this.buildPlaceholder(part, UNDELIVERED_FILE_REASON.unavailable);
  }

  private canSendSignedUrls(): boolean {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    if (
      !this.twentyConfigService.get('AI_SIGNED_FILE_URLS_ENABLED') ||
      !serverUrl.startsWith('https://')
    ) {
      return false;
    }

    try {
      validateDownloadUrl(serverUrl);

      return true;
    } catch {
      return false;
    }
  }

  private async prepareFileParts(
    messages: ModelMessage[],
    deliveryState: AgentFileDeliveryState,
  ): Promise<ModelMessage[]> {
    const budget: FileBudget = {
      remainingSizeBytes: deliveryState.limits.maxTotalSizeBytes,
      remainingFileCount: deliveryState.limits.maxFileCount,
    };
    const newestMessagesFirst =
      insertModelInputFileMessages(messages).reverse();
    const preparedMessages: ModelMessage[] = [];

    for (const message of newestMessagesFirst) {
      if (message.role !== 'user' || !isArray(message.content)) {
        preparedMessages.push(message);
        continue;
      }

      const preparedContent: Exclude<UserContent, string> = [];

      for (const part of [...message.content].reverse()) {
        preparedContent.push(
          part.type === 'file'
            ? await this.prepareFilePart({ part, deliveryState, budget })
            : part,
        );
      }

      preparedMessages.push({
        ...message,
        content: preparedContent.reverse(),
      });
    }

    return preparedMessages.reverse();
  }

  private async prepareFilePart({
    part,
    deliveryState,
    budget,
  }: {
    part: FilePart;
    deliveryState: AgentFileDeliveryState;
    budget: FileBudget;
  }): Promise<FilePart | TextPart> {
    const url = getFilePartHttpUrl(part);

    if (!isDefined(url)) {
      return part;
    }

    if (deliveryState.areFilesRejected) {
      return this.buildPlaceholder(part, UNDELIVERED_FILE_REASON.rejected);
    }

    const file = await this.loadFile(url, deliveryState);

    if (!isDefined(file)) {
      return this.buildPlaceholder(part, UNDELIVERED_FILE_REASON.unavailable);
    }

    if (deliveryState.rejectedFileIds.has(file.id)) {
      return this.buildPlaceholder(part, UNDELIVERED_FILE_REASON.rejected);
    }

    const mediaType = isNonEmptyString(part.mediaType)
      ? part.mediaType
      : file.mimeType;

    if (!deliveryState.nativeMimeTypes.has(mediaType)) {
      return {
        type: 'text',
        text: formatUnsupportedFilePlaceholder({
          filename: part.filename,
          mediaType,
        }),
      };
    }

    if (
      file.size > deliveryState.limits.maxFileSizeBytes ||
      file.size > budget.remainingSizeBytes ||
      budget.remainingFileCount === 0
    ) {
      return this.buildPlaceholder(part, UNDELIVERED_FILE_REASON.tooLarge);
    }

    budget.remainingSizeBytes -= file.size;
    budget.remainingFileCount -= 1;

    if (
      !deliveryState.canSendSignedUrls &&
      deliveryState.limits.mimeTypesRequiringUrl.has(mediaType)
    ) {
      return this.buildPlaceholder(part, UNDELIVERED_FILE_REASON.unavailable);
    }

    return { ...part, mediaType };
  }

  private downloadFiles(
    requestedFiles: Parameters<DownloadFunction>[0],
    deliveryState: AgentFileDeliveryState,
  ) {
    return Promise.all(
      requestedFiles.map(({ url, isUrlSupportedByModel }) =>
        deliveryState.canSendSignedUrls && isUrlSupportedByModel
          ? null
          : this.downloadFile(url.toString(), deliveryState),
      ),
    );
  }

  private async downloadFile(
    url: string,
    deliveryState: AgentFileDeliveryState,
  ) {
    const file = await this.loadFile(url, deliveryState);
    const bytes = isDefined(file)
      ? await this.loadFileBytes(file, deliveryState)
      : null;

    return isDefined(bytes) ? { data: bytes, mediaType: undefined } : null;
  }

  private buildPlaceholder(
    { filename, mediaType }: Pick<FilePart, 'filename' | 'mediaType'>,
    reason: string,
  ): TextPart {
    return {
      type: 'text',
      text: formatUnsupportedFilePlaceholder({ filename, mediaType, reason }),
    };
  }

  private loadFile(
    url: string,
    deliveryState: AgentFileDeliveryState,
  ): Promise<FileEntity | null> {
    const loadedFile = deliveryState.filesByUrl.get(url);

    if (isDefined(loadedFile)) {
      return loadedFile;
    }

    const fileLoad = this.findFileBySignedUrl(url, deliveryState.workspaceId);

    deliveryState.filesByUrl.set(url, fileLoad);

    return fileLoad;
  }

  private async findFileBySignedUrl(
    url: string,
    workspaceId: string,
  ): Promise<FileEntity | null> {
    const fileId = await this.fileUrlService.getFileIdFromSignedFileUrl({
      fileUrl: url,
      workspaceId,
    });

    return isDefined(fileId)
      ? this.fileService.getFileById({
          fileId,
          workspaceId,
          allowedFileFolders: AI_READABLE_FILE_FOLDERS,
        })
      : null;
  }

  private loadFileBytes(
    file: FileEntity,
    deliveryState: AgentFileDeliveryState,
  ): Promise<Buffer | null> {
    const loadedBytes = deliveryState.bytesByFileId.get(file.id);

    if (isDefined(loadedBytes)) {
      return loadedBytes;
    }

    const bytesLoad = this.readFileBytes(file, deliveryState);

    deliveryState.bytesByFileId.set(file.id, bytesLoad);

    return bytesLoad;
  }

  private async readFileBytes(
    file: FileEntity,
    deliveryState: AgentFileDeliveryState,
  ): Promise<Buffer | null> {
    try {
      const fileContent = await this.fileService.getFileStreamById({
        fileId: file.id,
        workspaceId: deliveryState.workspaceId,
        allowedFileFolders: AI_READABLE_FILE_FOLDERS,
      });

      if (!isDefined(fileContent)) {
        return null;
      }

      const bytes = await streamToBuffer(
        fileContent.stream,
        deliveryState.limits.maxFileSizeBytes,
      );

      deliveryState.fileIdsByBytes.set(bytes, file.id);

      return bytes;
    } catch (error) {
      this.logger.warn(`Could not read file ${file.id} for the model`, error);

      return null;
    }
  }
}
