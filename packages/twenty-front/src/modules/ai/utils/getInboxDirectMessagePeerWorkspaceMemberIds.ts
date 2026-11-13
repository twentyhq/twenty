import { isDefined } from 'twenty-shared/utils';

import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';

export const getInboxDirectMessagePeerWorkspaceMemberIds = ({
  thread,
  currentWorkspaceMemberId,
}: {
  thread: Pick<
    InboxThreadRecord,
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
