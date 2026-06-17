import { getToolName, isToolUIPart } from 'ai';
import {
  isExtendedFileUIPart,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

import { type AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';

export const mapUIMessagePartsToDBParts = (
  uiMessageParts: ExtendedUIMessagePart[],
  messageId: string,
  workspaceId: string,
): Partial<AgentMessagePartEntity>[] => {
  return uiMessageParts
    .map((part, index) => {
      const basePart: Partial<AgentMessagePartEntity> = {
        messageId,
        orderIndex: index,
        type: part.type,
        workspaceId,
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
          // Code execution parts are streamed during execution but don't need
          // to be persisted - the final result is captured in the tool part
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
              toolInput: part.input,
              toolOutput: part.output,
              errorMessage: part.errorText,
              state: part.state,
              providerExecuted: part.providerExecuted ?? null,
              // Provider-executed tools (e.g. Anthropic web search) carry
              // metadata that convertToModelMessages replays as providerOptions
              // on the tool-call/result. Persist it so reloaded history stays
              // byte-identical — otherwise the next turn misses the prompt cache.
              providerMetadata: part.callProviderMetadata ?? null,
            };
          }

          throw new Error(
            `Unsupported part type: ${(part as { type: string }).type}`,
          );
        }
      }
    })
    .filter((part): part is Partial<AgentMessagePartEntity> => part !== null);
};
