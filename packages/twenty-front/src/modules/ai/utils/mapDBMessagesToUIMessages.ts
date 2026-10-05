import { mapDBPartToUIMessagePart } from '@/ai/utils/mapDBPartToUIMessagePart';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { type AgentMessage } from '~/generated-metadata/graphql';

export const mapDBMessagesToUIMessages = (
  dbMessages: AgentMessage[],
): ExtendedUIMessage[] => {
  return dbMessages.map((dbMessage) => ({
    id: dbMessage.id,
    role: dbMessage.role as ExtendedUIMessage['role'],
    status: dbMessage.status as 'queued' | 'sent',
    parts: [...dbMessage.parts]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(mapDBPartToUIMessagePart)
      .filter(isDefined),
    metadata: {
      createdAt: dbMessage.createdAt,
      senderUserWorkspaceId: dbMessage.senderUserWorkspaceId,
    },
    threadId: dbMessage.threadId,
  }));
};
