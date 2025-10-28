import { mapDBPartToUIMessagePart } from '@/ai/utils/mapDBPartToUIMessagePart';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type AgentChatMessage } from '~/generated/graphql';

export const mapDBMessagesToUIMessages = (
  dbMessages: AgentChatMessage[],
): ExtendedUIMessage[] => {
  return dbMessages.map((dbMessage) => ({
    id: dbMessage.id,
    role: dbMessage.role as ExtendedUIMessage['role'],
    parts: dbMessage.parts.map(mapDBPartToUIMessagePart),
    metadata: {
      createdAt: dbMessage.createdAt,
    },
  }));
};
