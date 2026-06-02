import {
  type ExtendedFileUIPart,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

import { type AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';

// Maps TypeORM entity fields to UI message parts.
// A parallel mapping for GraphQL DTOs exists in the frontend at:
// packages/twenty-front/src/modules/ai/utils/mapDBPartToUIMessagePart.ts

export const mapDBPartToUIMessagePart = (
  part: AgentMessagePartEntity,
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
    case 'data-routing-status':
      return null;
    default: {
      if (part.type.includes('tool-') && part.toolCallId) {
        return {
          type: part.type,
          toolCallId: part.toolCallId,
          input: part.toolInput ?? {},
          output: part.toolOutput,
          errorText: part.errorMessage ?? '',
          state: part.state,
          ...(part.providerExecuted != null && {
            providerExecuted: part.providerExecuted,
          }),
        } as ExtendedUIMessagePart;
      }

      return null;
    }
  }
};
