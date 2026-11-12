import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export const getAgentChatDirectMessagePeerWorkspaceMemberIds = ({
  thread,
  currentWorkspaceMemberId,
}: {
  thread: Pick<
    AgentChatThreadRecord,
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
