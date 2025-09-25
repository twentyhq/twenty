import type { UIMessagePart } from 'ai';

import { type AgentChatMessagePartEntity } from 'src/engine/metadata-modules/agent/agent-chat-message-part.entity';

export const mapDBPartToUIMessagePart = (
  part: AgentChatMessagePartEntity,
): UIMessagePart<never, never> => {
  switch (part.type) {
    case 'text':
      return {
        type: 'text',
        text: part.textContent!,
      };
    case 'reasoning':
      return {
        type: 'reasoning',
        text: part.reasoningContent!,
      };
    case 'file':
      return {
        type: 'file',
        mediaType: part.fileMediaType!,
        filename: part.fileFilename!,
        url: part.fileUrl!,
      };
    case 'source-url':
      return {
        type: 'source-url',
        sourceId: part.sourceUrlSourceId!,
        url: part.sourceUrlUrl!,
        title: part.sourceUrlTitle!,
        providerMetadata: part.providerMetadata ?? undefined,
      };
    case 'source-document':
      return {
        type: 'source-document',
        sourceId: part.sourceDocumentSourceId!,
        mediaType: part.sourceDocumentMediaType!,
        title: part.sourceDocumentTitle!,
        filename: part.sourceDocumentFilename!,
        providerMetadata: part.providerMetadata ?? undefined,
      };
    case 'step-start':
      return {
        type: 'step-start',
      };
    default:
      throw new Error(`Unsupported part type: ${part.type}`);
  }
};
