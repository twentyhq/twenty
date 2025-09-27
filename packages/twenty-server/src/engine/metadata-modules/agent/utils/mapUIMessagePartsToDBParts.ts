import { type ToolUIPart, type UIMessagePart, type UITool } from 'ai';

import { type AgentChatMessagePartEntity } from 'src/engine/metadata-modules/agent/agent-chat-message-part.entity';

export const mapUIMessagePartsToDBParts = (
  uiMessageParts: UIMessagePart<never, Record<string, UITool>>[],
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
      default:
        {
          if (part.type.includes('tool-')) {
            const { toolCallId, input, output, errorText } = part as ToolUIPart;

            return {
              ...basePart,
              toolCallId: toolCallId,
              toolInput: input,
              toolOutput: output,
              errorMessage: errorText,
            };
          }
        }
        throw new Error(`Unsupported part type: ${part.type}`);
    }
  });
};
