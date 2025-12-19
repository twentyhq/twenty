import { type ToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { type AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';

const isToolPart = (part: ExtendedUIMessagePart): part is ToolUIPart => {
  return part.type.includes('tool-') && 'toolCallId' in part;
};

export const mapUIMessagePartsToDBParts = (
  uiMessageParts: ExtendedUIMessagePart[],
  messageId: string,
): Partial<AgentMessagePartEntity>[] => {
  return uiMessageParts
    .map((part, index) => {
      const basePart: Partial<AgentMessagePartEntity> = {
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
          };
        case 'file':
          return {
            ...basePart,
            fileMediaType: part.mediaType,
            fileFilename: part.filename,
            fileUrl: part.url,
          };
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
        default:
          {
            if (isToolPart(part)) {
              const { toolCallId, input, output, errorText, state } = part;

              return {
                ...basePart,
                toolCallId: toolCallId,
                toolInput: input,
                toolOutput: output,
                errorMessage: errorText,
                state,
              };
            }
          }
          throw new Error(`Unsupported part type: ${part.type}`);
      }
    })
    .filter((part): part is Partial<AgentMessagePartEntity> => part !== null);
};
