import { Injectable } from '@nestjs/common';

import { validateDownloadUrl } from '@ai-sdk/provider-utils';
import { isArray, isNonEmptyString, isString } from '@sniptt/guards';
import {
  type Experimental_DownloadFunction as DownloadFunction,
  type FilePart,
  type LanguageModel,
  type ModelMessage,
  type TextPart,
  type UserContent,
  wrapLanguageModel,
} from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AgentFileLoaderService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-file-loader.service';
import { AgentFileRejectionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-file-rejection.service';
import { type AgentFileDeliveryState } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-file-delivery-state.type';
import { buildFilePlaceholder } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-file-placeholder.util';
import { getFilePartHttpUrl } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/get-file-part-http-url.util';
import { getModelFileLimits } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/get-model-file-limits.util';
import { insertModelInputFileMessages } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/insert-model-input-file-messages.util';
import { type AiModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';
import { getNativeMimeTypesForModalities } from 'src/engine/metadata-modules/ai/ai-models/utils/get-native-mime-types-for-modalities.util';

type AgentFileDelivery = {
  model: LanguageModel;
  prepareFileParts: (messages: ModelMessage[]) => Promise<ModelMessage[]>;
  downloadFiles?: DownloadFunction;
};

type UserContentPart = Exclude<UserContent, string>[number];

type FileBudget = {
  remainingSizeBytes: number;
  remainingFileCount: number;
};

@Injectable()
export class AgentFilePartService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly agentFileLoaderService: AgentFileLoaderService,
    private readonly agentFileRejectionService: AgentFileRejectionService,
  ) {}

  createFileDelivery({
    model,
    modelConfig,
    modelId,
    workspaceId,
    operationType,
    spenders,
  }: Pick<
    AgentFileDeliveryState,
    'modelId' | 'workspaceId' | 'operationType' | 'spenders'
  > & {
    model: LanguageModel;
    modelConfig: Pick<AiModelConfig, 'sdkPackage' | 'modalities'>;
  }): AgentFileDelivery {
    if (isString(model)) {
      return { model, prepareFileParts: async (messages) => messages };
    }

    const limits = getModelFileLimits(modelConfig.sdkPackage);
    const deliveryState: AgentFileDeliveryState = {
      modelId,
      workspaceId,
      operationType,
      spenders,
      limits,
      nativeMimeTypes: getNativeMimeTypesForModalities(modelConfig.modalities),
      fileLoader: this.agentFileLoaderService.createRunFileLoader({
        workspaceId,
        maxFileSizeBytes: limits.maxFileSizeBytes,
      }),
      canSendSignedUrls: this.canSendSignedUrls(),
      areFilesRejected: false,
      deliveredFileIds: new Set(),
      rejectedFileIds: new Set(),
    };

    return {
      model: wrapLanguageModel({
        model,
        middleware:
          this.agentFileRejectionService.buildMiddleware(deliveryState),
      }),
      prepareFileParts: (messages) =>
        this.prepareFileParts({ messages, deliveryState }),
      downloadFiles: (requestedFiles) =>
        this.downloadFiles({ requestedFiles, deliveryState }),
    };
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

  private async prepareFileParts({
    messages,
    deliveryState,
  }: {
    messages: ModelMessage[];
    deliveryState: AgentFileDeliveryState;
  }): Promise<ModelMessage[]> {
    const messagesWithInputFiles = insertModelInputFileMessages(messages);
    const originalMessages = new Set(messages);
    const currentTurnStartIndex = messagesWithInputFiles.reduce(
      (startIndex, message, index) =>
        message.role === 'user' && originalMessages.has(message)
          ? index
          : startIndex,
      0,
    );
    const getFileParts = (turnMessages: ModelMessage[]) =>
      turnMessages.flatMap((message) =>
        message.role === 'user' && isArray(message.content)
          ? message.content.filter((part) => part.type === 'file')
          : [],
      );
    const budget: FileBudget = {
      remainingSizeBytes: deliveryState.limits.maxTotalSizeBytes,
      remainingFileCount: deliveryState.limits.maxFileCount,
    };
    const preparedParts = new Map<UserContentPart, FilePart | TextPart>();

    for (const part of getFileParts(
      messagesWithInputFiles.slice(0, currentTurnStartIndex),
    )) {
      preparedParts.set(
        part,
        buildFilePlaceholder({ part, reason: 'earlierTurn' }),
      );
    }

    for (const part of getFileParts(
      messagesWithInputFiles.slice(currentTurnStartIndex),
    ).reverse()) {
      preparedParts.set(
        part,
        await this.prepareFilePart({ part, deliveryState, budget }),
      );
    }

    return messagesWithInputFiles.map((message) => {
      if (message.role !== 'user' || !isArray(message.content)) {
        return message;
      }

      return {
        ...message,
        content: message.content.map((part) => preparedParts.get(part) ?? part),
      };
    });
  }

  private async prepareFilePart({
    part,
    deliveryState: {
      areFilesRejected,
      fileLoader,
      rejectedFileIds,
      nativeMimeTypes,
      limits,
      canSendSignedUrls,
    },
    budget,
  }: {
    part: FilePart;
    deliveryState: Pick<
      AgentFileDeliveryState,
      | 'areFilesRejected'
      | 'fileLoader'
      | 'rejectedFileIds'
      | 'nativeMimeTypes'
      | 'limits'
      | 'canSendSignedUrls'
    >;
    budget: FileBudget;
  }): Promise<FilePart | TextPart> {
    const url = getFilePartHttpUrl(part);

    if (!isDefined(url)) {
      return part;
    }

    if (areFilesRejected) {
      return buildFilePlaceholder({ part, reason: 'rejected' });
    }

    const file = await fileLoader.loadFile(url);

    if (!isDefined(file)) {
      return buildFilePlaceholder({ part, reason: 'unavailable' });
    }

    if (rejectedFileIds.has(file.id)) {
      return buildFilePlaceholder({ part, reason: 'rejected' });
    }

    const mediaType = isNonEmptyString(part.mediaType)
      ? part.mediaType
      : file.mimeType;

    if (!nativeMimeTypes.has(mediaType)) {
      return buildFilePlaceholder({
        part: { filename: part.filename, mediaType },
      });
    }

    if (!canSendSignedUrls && limits.mimeTypesRequiringUrl.has(mediaType)) {
      return buildFilePlaceholder({ part, reason: 'unavailable' });
    }

    if (
      file.size > limits.maxFileSizeBytes ||
      file.size > budget.remainingSizeBytes ||
      budget.remainingFileCount === 0
    ) {
      return buildFilePlaceholder({ part, reason: 'tooLarge' });
    }

    budget.remainingSizeBytes -= file.size;
    budget.remainingFileCount -= 1;

    return { ...part, mediaType };
  }

  private downloadFiles({
    requestedFiles,
    deliveryState,
  }: {
    requestedFiles: Parameters<DownloadFunction>[0];
    deliveryState: Pick<
      AgentFileDeliveryState,
      'canSendSignedUrls' | 'fileLoader'
    >;
  }) {
    return Promise.all(
      requestedFiles.map(async ({ url, isUrlSupportedByModel }) => {
        if (deliveryState.canSendSignedUrls && isUrlSupportedByModel) {
          return null;
        }

        const bytes = await deliveryState.fileLoader.loadFileBytes(
          url.toString(),
        );

        return isDefined(bytes) ? { data: bytes, mediaType: undefined } : null;
      }),
    );
  }
}
