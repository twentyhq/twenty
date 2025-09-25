import type { UIMessagePart } from 'ai';

import { type AgentChatMessagePartEntity } from 'src/engine/metadata-modules/agent/agent-chat-message-part.entity';

export const mapUIMessagePartsToDBParts = (
  uiMessageParts: UIMessagePart<never, never>[],
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
        throw new Error(`Unsupported part type: ${part.type}`);
    }
  });
};
