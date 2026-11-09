import { Injectable, Logger } from '@nestjs/common';

import {
  type LanguageModelV4,
  type LanguageModelV4CallOptions,
  type LanguageModelV4FilePart,
  type LanguageModelV4Prompt,
  type LanguageModelV4TextPart,
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

import { AI_READABLE_FILE_FOLDERS } from 'src/engine/core-modules/file/constants/ai-readable-file-folders.constant';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UNDELIVERED_FILE_REASON } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/undelivered-file-reason.constant';
import { type ModelFileLimits } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/model-file-limits.type';
import { getFilePartHttpUrl } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/get-file-part-http-url.util';
import { getModelFileLimits } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/get-model-file-limits.util';
import { insertModelInputFileMessages } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/insert-model-input-file-messages.util';
import { type AiModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';
import { formatUnsupportedFilePlaceholder } from 'src/engine/metadata-modules/ai/ai-models/utils/format-unsupported-file-placeholder.util';
import { getNativeMimeTypesForModalities } from 'src/engine/metadata-modules/ai/ai-models/utils/get-native-mime-types-for-modalities.util';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

const FILE_REJECTION_STATUS_CODES = new Set([400, 413, 422]);
const FILE_CHECK_PROMPT = 'Reply with OK.';
const FILE_CHECK_MAX_OUTPUT_TOKENS = 16;

type AgentFileDelivery = {
  model: LanguageModel;
  prepareFileParts: (messages: ModelMessage[]) => Promise<ModelMessage[]>;
  downloadFiles?: DownloadFunction;
};

type AgentRunFiles = {
  workspaceId: string;
  canSendSignedUrls: boolean;
  areFilesRejected: boolean;
  nativeMimeTypes: Set<string>;
  limits: ModelFileLimits;
  filesByUrl: Map<string, Promise<FileEntity | null>>;
  bytesByFileId: Map<string, Promise<Buffer | null>>;
  fileIdsByBytes: Map<Uint8Array | string, string>;
  rejectedFileIds: Set<string>;
};

type FilePartReplacement = LanguageModelV4FilePart | LanguageModelV4TextPart;

type FileRetryArguments = {
  fileRejection: APICallError;
  params: LanguageModelV4CallOptions;
  model: LanguageModelV4;
  runFiles: AgentRunFiles;
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
  ) {}

  createFileDelivery({
    model,
    modelConfig,
    workspaceId,
  }: {
    model: LanguageModel;
    modelConfig: Pick<AiModelConfig, 'sdkPackage' | 'modalities'>;
    workspaceId: string;
  }): AgentFileDelivery {
    if (isString(model)) {
      return { model, prepareFileParts: async (messages) => messages };
    }

    const runFiles: AgentRunFiles = {
      workspaceId,
      canSendSignedUrls: this.canSendSignedUrls(),
      areFilesRejected: false,
      nativeMimeTypes: getNativeMimeTypesForModalities(modelConfig.modalities),
      limits: getModelFileLimits(modelConfig.sdkPackage),
      filesByUrl: new Map(),
      bytesByFileId: new Map(),
      fileIdsByBytes: new Map(),
      rejectedFileIds: new Set(),
    };

    return {
      model: wrapLanguageModel({
        model,
        middleware: this.buildFileFallback(runFiles),
      }),
      prepareFileParts: (messages) => this.prepareFileParts(messages, runFiles),
      downloadFiles: (requestedFiles) =>
        this.downloadFiles(requestedFiles, runFiles),
    };
  }

  private buildFileFallback(runFiles: AgentRunFiles): LanguageModelMiddleware {
    return {
      specificationVersion: 'v4',
      transformParams: async ({ params }) => ({
        ...params,
        prompt: await this.replaceFileParts(params.prompt, (part) =>
          this.replaceUnreadableFilePart(part, runFiles),
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
            runFiles,
          };
          const hasFileUrl = this.getPromptFileParts(params.prompt).some(
            (part) => part.data.type === 'url',
          );

          return hasFileUrl
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
    runFiles: AgentRunFiles,
  ): Promise<FilePartReplacement> {
    if (part.data.type !== 'url') {
      return part;
    }

    const file = await this.loadFile(part.data.url.toString(), runFiles);

    return !isDefined(file) || isNull(await runFiles.bytesByFileId.get(file.id))
      ? this.buildPlaceholder(part, UNDELIVERED_FILE_REASON.unavailable)
      : part;
  }

  private async retryFileUrlsAsBytes({
    fileRejection,
    params,
    model,
    runFiles,
  }: FileRetryArguments) {
    this.logger.warn(
      `Provider refused a file link, retrying with bytes: ${fileRejection.message}`,
    );
    runFiles.canSendSignedUrls = false;

    const paramsWithBytes = {
      ...params,
      prompt: await this.replaceFileParts(params.prompt, (part) =>
        this.replaceFileUrlWithBytes(part, runFiles),
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
        runFiles,
      });
    }
  }

  private async retryWithoutRejectedFiles(retryArguments: FileRetryArguments) {
    const { fileRejection, params, model, runFiles } = retryArguments;

    this.logger.warn(
      `Provider refused a file, checking each file: ${fileRejection.message}`,
    );

    const rejectedFileParts = await this.findRejectedFileParts(params, model);

    if (rejectedFileParts.size === 0) {
      return this.retryWithoutFiles(retryArguments);
    }

    rejectedFileParts.forEach((part) =>
      this.rememberRejectedFile(part, runFiles),
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
        runFiles,
      });
    }
  }

  private async findRejectedFileParts(
    params: LanguageModelV4CallOptions,
    model: LanguageModelV4,
  ): Promise<Set<LanguageModelV4FilePart>> {
    const fileParts = this.getPromptFileParts(params.prompt);
    const rejections = await Promise.all(
      fileParts.map((part) => this.isFilePartRejected(part, params, model)),
    );

    return new Set(fileParts.filter((_part, index) => rejections[index]));
  }

  private async isFilePartRejected(
    part: LanguageModelV4FilePart,
    { abortSignal, headers }: LanguageModelV4CallOptions,
    model: LanguageModelV4,
  ): Promise<boolean> {
    const prompt: LanguageModelV4Prompt = [
      {
        role: 'user',
        content: [part, { type: 'text', text: FILE_CHECK_PROMPT }],
      },
    ];

    try {
      await model.doGenerate({
        prompt,
        maxOutputTokens: FILE_CHECK_MAX_OUTPUT_TOKENS,
        abortSignal,
        headers,
      });

      return false;
    } catch (error) {
      return this.isFileRejectedByProvider(error, prompt);
    }
  }

  private rememberRejectedFile(
    part: LanguageModelV4FilePart,
    runFiles: AgentRunFiles,
  ): void {
    if (part.data.type !== 'data') {
      return;
    }

    const fileId = runFiles.fileIdsByBytes.get(part.data.data);

    if (isDefined(fileId)) {
      runFiles.rejectedFileIds.add(fileId);
    }
  }

  private async retryWithoutFiles({
    fileRejection,
    params,
    model,
    runFiles,
  }: FileRetryArguments) {
    this.logger.warn(
      `Provider refused the files of this run: ${fileRejection.message}`,
    );
    runFiles.areFilesRejected = true;

    return model.doStream({
      ...params,
      prompt: await this.replaceFileParts(params.prompt, (part) =>
        this.buildPlaceholder(part, UNDELIVERED_FILE_REASON.rejected),
      ),
    });
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
    runFiles: AgentRunFiles,
  ): Promise<FilePartReplacement> {
    if (part.data.type !== 'url') {
      return part;
    }

    const file = await this.loadFile(part.data.url.toString(), runFiles);

    const bytes =
      isDefined(file) &&
      !runFiles.limits.mimeTypesRequiringUrl.has(part.mediaType)
        ? await this.loadFileBytes(file, runFiles)
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
    runFiles: AgentRunFiles,
  ): Promise<ModelMessage[]> {
    const budget: FileBudget = {
      remainingSizeBytes: runFiles.limits.maxTotalSizeBytes,
      remainingFileCount: runFiles.limits.maxFileCount,
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
            ? await this.prepareFilePart({ part, runFiles, budget })
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
    runFiles,
    budget,
  }: {
    part: FilePart;
    runFiles: AgentRunFiles;
    budget: FileBudget;
  }): Promise<FilePart | TextPart> {
    const url = getFilePartHttpUrl(part);

    if (!isDefined(url)) {
      return part;
    }

    if (runFiles.areFilesRejected) {
      return this.buildPlaceholder(part, UNDELIVERED_FILE_REASON.rejected);
    }

    const file = await this.loadFile(url, runFiles);

    if (!isDefined(file)) {
      return this.buildPlaceholder(part, UNDELIVERED_FILE_REASON.unavailable);
    }

    if (runFiles.rejectedFileIds.has(file.id)) {
      return this.buildPlaceholder(part, UNDELIVERED_FILE_REASON.rejected);
    }

    const mediaType = isNonEmptyString(part.mediaType)
      ? part.mediaType
      : file.mimeType;

    if (!runFiles.nativeMimeTypes.has(mediaType)) {
      return {
        type: 'text',
        text: formatUnsupportedFilePlaceholder({
          filename: part.filename,
          mediaType,
        }),
      };
    }

    if (
      file.size > runFiles.limits.maxFileSizeBytes ||
      file.size > budget.remainingSizeBytes ||
      budget.remainingFileCount === 0
    ) {
      return this.buildPlaceholder(part, UNDELIVERED_FILE_REASON.tooLarge);
    }

    budget.remainingSizeBytes -= file.size;
    budget.remainingFileCount -= 1;

    if (
      !runFiles.canSendSignedUrls &&
      runFiles.limits.mimeTypesRequiringUrl.has(mediaType)
    ) {
      return this.buildPlaceholder(part, UNDELIVERED_FILE_REASON.unavailable);
    }

    return { ...part, mediaType };
  }

  private downloadFiles(
    requestedFiles: Parameters<DownloadFunction>[0],
    runFiles: AgentRunFiles,
  ) {
    return Promise.all(
      requestedFiles.map(({ url, isUrlSupportedByModel }) =>
        runFiles.canSendSignedUrls && isUrlSupportedByModel
          ? null
          : this.downloadFile(url.toString(), runFiles),
      ),
    );
  }

  private async downloadFile(url: string, runFiles: AgentRunFiles) {
    const file = await this.loadFile(url, runFiles);
    const bytes = isDefined(file)
      ? await this.loadFileBytes(file, runFiles)
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
    runFiles: AgentRunFiles,
  ): Promise<FileEntity | null> {
    const loadedFile = runFiles.filesByUrl.get(url);

    if (isDefined(loadedFile)) {
      return loadedFile;
    }

    const fileLoad = this.findFileBySignedUrl(url, runFiles.workspaceId);

    runFiles.filesByUrl.set(url, fileLoad);

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
      ? this.fileService.findReadableFileById({
          fileId,
          workspaceId,
          allowedFileFolders: AI_READABLE_FILE_FOLDERS,
        })
      : null;
  }

  private loadFileBytes(
    file: FileEntity,
    runFiles: AgentRunFiles,
  ): Promise<Buffer | null> {
    const loadedBytes = runFiles.bytesByFileId.get(file.id);

    if (isDefined(loadedBytes)) {
      return loadedBytes;
    }

    const bytesLoad = this.readFileBytes(file, runFiles);

    runFiles.bytesByFileId.set(file.id, bytesLoad);

    return bytesLoad;
  }

  private async readFileBytes(
    file: FileEntity,
    runFiles: AgentRunFiles,
  ): Promise<Buffer | null> {
    try {
      const fileContent = await this.fileService.getFileStreamById({
        fileId: file.id,
        workspaceId: runFiles.workspaceId,
        allowedFileFolders: AI_READABLE_FILE_FOLDERS,
      });

      if (!isDefined(fileContent)) {
        return null;
      }

      const bytes = await streamToBuffer(
        fileContent.stream,
        runFiles.limits.maxFileSizeBytes,
      );

      runFiles.fileIdsByBytes.set(bytes, file.id);

      return bytes;
    } catch (error) {
      this.logger.warn(`Could not read file ${file.id} for the model`, error);

      return null;
    }
  }
}
