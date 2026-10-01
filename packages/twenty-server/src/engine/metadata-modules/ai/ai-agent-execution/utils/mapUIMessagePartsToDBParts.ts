import { getToolName, isToolUIPart } from 'ai';
import {
  isExtendedFileUIPart,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

import { AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';

export const mapUIMessagePartsToDBParts = (
  uiMessageParts: ExtendedUIMessagePart[],
  messageId: string,
  _workspaceId: string,
): Partial<AgentMessagePartWorkspaceEntity>[] => {
  return uiMessageParts
    .map((part, index) => {
      const basePart: Partial<AgentMessagePartWorkspaceEntity> = {
        messageId,
        orderIndex: index,
        type: part.type,
      };

      switch (part.type) {
        case 'text':
          return {
            ...basePart,
            textContent: part.text,
          };
        case 'reasoning':
          return {
            ...basePart,
            reasoningContent: part.text,
            providerMetadata: part.providerMetadata ?? null,
          };
        case 'file': {
          if (!isExtendedFileUIPart(part)) {
            throw new Error('Expected file part');
          }

          return {
            ...basePart,
            fileFilename: part.filename,
            fileId: part.fileId,
          };
        }
        case 'source-url':
          return {
            ...basePart,
            sourceUrlSourceId: part.sourceId,
            sourceUrlUrl: part.url,
            sourceUrlTitle: part.title,
            providerMetadata: part.providerMetadata ?? null,
          };
        case 'source-document':
          return {
            ...basePart,
            sourceDocumentSourceId: part.sourceId,
            sourceDocumentMediaType: part.mediaType,
            sourceDocumentTitle: part.title,
            sourceDocumentFilename: part.filename,
            providerMetadata: part.providerMetadata ?? null,
          };
        case 'step-start':
          return basePart;
        case 'data-compaction':
          return null;
        case 'data-routing-status':
          return {
            ...basePart,
            textContent: part.data.text,
            state: part.data.state,
          };
        case 'data-code-execution':
          // streamed only: the final result is captured in the tool part
          return null;
        case 'data-thread-title':
          // Thread title is a transient notification for the client
          return null;
        default: {
          if (isToolUIPart(part)) {
            return {
              ...basePart,
              toolName: getToolName(part),
              toolCallId: part.toolCallId,
              // A nullish input yields an invalid tool_use block (#21695).
              toolInput: part.input ?? {},
              toolOutput: part.output,
              errorMessage: part.errorText,
              state: part.state,
              providerExecuted: part.providerExecuted ?? null,
              providerMetadata: part.callProviderMetadata ?? null,
            };
          }

          throw new Error(
            `Unsupported part type: ${(part as { type: string }).type}`,
          );
        }
      }
    })
    .filter(
      (part): part is Partial<AgentMessagePartWorkspaceEntity> => part !== null,
    );
};
