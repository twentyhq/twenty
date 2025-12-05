import { mapDBPartToUIMessagePart } from '@/ai/utils/mapDBPartToUIMessagePart';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type AgentMessage } from '~/generated/graphql';

export const mapDBMessagesToUIMessages = (
  dbMessages: AgentMessage[],
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
