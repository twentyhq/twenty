import { type UIMessageWithMetadata } from '@/ai/types/UIMessageWithMetadata';
import { mapDBPartToUIMessagePart } from '@/ai/utils/mapDBPartToUIMessagePart';
import { type AgentChatMessage } from '~/generated/graphql';

export const mapDBMessagesToUIMessages = (
  dbMessages: AgentChatMessage[],
): UIMessageWithMetadata[] => {
  return dbMessages.map((dbMessage) => ({
    id: dbMessage.id,
    role: dbMessage.role as UIMessageWithMetadata['role'],
    parts: dbMessage.parts.map(mapDBPartToUIMessagePart),
    metadata: {
      createdAt: dbMessage.createdAt,
    },
  }));
};
