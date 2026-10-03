import { isDefined } from 'twenty-shared/utils';
import {
  type ExtendedFileUIPart,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';

// keep in sync with packages/twenty-front/src/modules/ai/utils/mapDBPartToUIMessagePart.ts

export const mapDBPartToUIMessagePart = (
  part: AgentMessagePartWorkspaceEntity,
): ExtendedUIMessagePart | null => {
  switch (part.type) {
    case 'text':
      return {
        type: 'text',
        text: part.textContent ?? '',
      };
    case 'reasoning':
      return {
        type: 'reasoning',
        text: part.reasoningContent ?? '',
        state: (part.state as 'streaming' | 'done') ?? 'done',
        providerMetadata: part.providerMetadata ?? undefined,
      };
    case 'file':
      return {
        type: 'file',
        mediaType: part.file?.mimeType ?? 'application/octet-stream',
        filename: part.fileFilename ?? '',
        url: '',
        fileId: part.fileId ?? '',
      } as ExtendedFileUIPart;
    case 'source-url':
      return {
        type: 'source-url',
        sourceId: part.sourceUrlSourceId ?? '',
        url: part.sourceUrlUrl ?? '',
        title: part.sourceUrlTitle ?? '',
        providerMetadata: part.providerMetadata ?? undefined,
      };
    case 'source-document':
      return {
        type: 'source-document',
        sourceId: part.sourceDocumentSourceId ?? '',
        mediaType: part.sourceDocumentMediaType ?? '',
        title: part.sourceDocumentTitle ?? '',
        filename: part.sourceDocumentFilename ?? '',
        providerMetadata: part.providerMetadata ?? undefined,
      };
    case 'step-start':
      return {
        type: 'step-start',
      };
    default: {
      const isStaticToolPart =
        part.type.startsWith('tool-') && part.toolCallId !== null;
      const isDynamicToolPart =
        part.type === 'dynamic-tool' && part.toolCallId !== null;

      if (isStaticToolPart || isDynamicToolPart) {
        return {
          type: part.type,
          ...(isDynamicToolPart && { toolName: part.toolName ?? '' }),
          toolCallId: part.toolCallId,
          input: part.toolInput ?? {},
          output: part.toolOutput,
          errorText: part.errorMessage ?? '',
          state: part.state,
          ...(part.providerExecuted != null && {
            providerExecuted: part.providerExecuted,
          }),
          ...(part.providerMetadata != null && {
            callProviderMetadata: part.providerMetadata,
          }),
        } as ExtendedUIMessagePart;
      }

      return null;
    }
  }
};

export const mapDBPartsToUIMessageParts = (
  parts: AgentMessagePartWorkspaceEntity[],
): ExtendedUIMessagePart[] =>
  [...parts]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(mapDBPartToUIMessagePart)
    .filter(isDefined);
