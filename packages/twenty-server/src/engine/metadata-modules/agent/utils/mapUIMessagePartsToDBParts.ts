import {
  type ToolUIPart,
  type UIDataTypes,
  type UIMessagePart,
  type UITools,
} from 'ai';

import { type AgentChatMessagePartEntity } from 'src/engine/metadata-modules/agent/agent-chat-message-part.entity';

const isToolPart = (
  part: UIMessagePart<UIDataTypes, UITools>,
): part is ToolUIPart => {
  return part.type.includes('tool-') && 'toolCallId' in part;
};

export const mapUIMessagePartsToDBParts = (
  uiMessageParts: UIMessagePart<UIDataTypes, UITools>[],
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
          if (isToolPart(part)) {
            const { toolCallId, input, output, errorText } = part;

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
