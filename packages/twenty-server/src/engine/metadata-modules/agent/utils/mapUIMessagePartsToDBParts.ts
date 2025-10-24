import { type ToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { type AgentChatMessagePartEntity } from 'src/engine/metadata-modules/agent/agent-chat-message-part.entity';

const isToolPart = (part: ExtendedUIMessagePart): part is ToolUIPart => {
  return part.type.includes('tool-') && 'toolCallId' in part;
};

export const mapUIMessagePartsToDBParts = (
  uiMessageParts: ExtendedUIMessagePart[],
  messageId: string,
): Partial<AgentChatMessagePartEntity>[] => {
  return uiMessageParts.map((part, index) => {
    const basePart: Partial<AgentChatMessagePartEntity> = {
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
  });
};
