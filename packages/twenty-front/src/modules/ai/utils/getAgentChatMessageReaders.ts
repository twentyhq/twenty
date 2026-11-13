import { isDefined } from 'twenty-shared/utils';

import { type AiChatThreadReadPosition } from '@/ai/types/AgentChatThreadReadPosition';

export const getAiChatMessageReaders = ({
  readPositions,
  createdAt,
  senderWorkspaceMemberId,
}: {
  readPositions: AiChatThreadReadPosition[];
  createdAt: Date | string;
  senderWorkspaceMemberId: string | undefined;
}) => {
  const createdAtMs = new Date(createdAt).getTime();
  const recipientReadPositions = readPositions.filter(
    ({ workspaceMemberId }) => workspaceMemberId !== senderWorkspaceMemberId,
  );
  const hasRead = ({ lastReadAt }: AiChatThreadReadPosition) =>
    isDefined(lastReadAt) && new Date(lastReadAt).getTime() >= createdAtMs;

  return {
    readerWorkspaceMemberIds: recipientReadPositions
      .filter(hasRead)
      .map(({ workspaceMemberId }) => workspaceMemberId),
    pendingWorkspaceMemberIds: recipientReadPositions
      .filter((readPosition) => !hasRead(readPosition))
      .map(({ workspaceMemberId }) => workspaceMemberId),
  };
};
