import { type Location } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { getAiChatPageThreadId } from '@/ai-chat/utils/getAiChatPageThreadId';
import { type InboxRecordRouteObjectNames } from '@/ai-chat/types/InboxRecordRouteObjectNames';
import { isAiChatHandoffSkipped } from '@/ai-chat/utils/isAiChatHandoffSkipped';
import { isAiChatPath } from '~/utils/isAiChatPath';
import { isInboxPath } from '~/utils/isInboxPath';
import { isSettingsPath } from '~/utils/isSettingsPath';

type AiChatPageSidePanelContinuation =
  | { type: 'none' }
  | { type: 'endWorkspaceSetupChat' }
  | { type: 'continueInSidePanel'; threadId: string | undefined };

export const getAiChatPageSidePanelContinuation = ({
  previousPathname,
  location,
  isMobile,
  newAiChatThreadId,
  inboxRecordRouteObjectNames,
  isNewAiChatThreadReplySending,
}: {
  previousPathname: string;
  location: Pick<Location, 'pathname' | 'state'>;
  isMobile: boolean;
  newAiChatThreadId: string;
  inboxRecordRouteObjectNames: InboxRecordRouteObjectNames | null;
  isNewAiChatThreadReplySending: boolean;
}): AiChatPageSidePanelContinuation => {
  const threadId = getAiChatPageThreadId({
    pathname: previousPathname,
    newAiChatThreadId,
    inboxRecordRouteObjectNames,
  });

  if (
    !isDefined(threadId) ||
    isMobile ||
    isAiChatPath(location.pathname) ||
    isInboxPath(location.pathname, inboxRecordRouteObjectNames) ||
    isAiChatHandoffSkipped(location.state)
  ) {
    return { type: 'none' };
  }

  if (isSettingsPath(location.pathname)) {
    return { type: 'endWorkspaceSetupChat' };
  }

  const isIdleNewChat =
    threadId === newAiChatThreadId && !isNewAiChatThreadReplySending;

  return {
    type: 'continueInSidePanel',
    threadId: isIdleNewChat ? undefined : threadId,
  };
};
