import { isDefined } from 'twenty-shared/utils';

import { type AiChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export const getInboxDirectMessagePeerWorkspaceMemberIds = ({
  thread,
  currentWorkspaceMemberId,
}: {
  thread: Pick<
    AiChatThreadRecord,
    | 'directMessageFirstWorkspaceMemberId'
    | 'directMessageSecondWorkspaceMemberId'
  >;
  currentWorkspaceMemberId: string | undefined;
}) =>
  [
    thread.directMessageFirstWorkspaceMemberId,
    thread.directMessageSecondWorkspaceMemberId,
  ].filter(
    (workspaceMemberId): workspaceMemberId is string =>
      isDefined(workspaceMemberId) &&
      workspaceMemberId !== currentWorkspaceMemberId,
  );
