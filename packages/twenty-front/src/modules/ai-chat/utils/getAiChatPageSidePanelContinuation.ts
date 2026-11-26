import { type Location } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { getAiChatPageThreadId } from '@/ai-chat/utils/getAiChatPageThreadId';
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
  isNewAiChatThreadReplySending,
}: {
  previousPathname: string;
  location: Pick<Location, 'pathname' | 'state'>;
  isMobile: boolean;
  newAiChatThreadId: string;
  isNewAiChatThreadReplySending: boolean;
}): AiChatPageSidePanelContinuation => {
  const threadId = getAiChatPageThreadId({
    pathname: previousPathname,
    newAiChatThreadId,
  });

  if (
    !isDefined(threadId) ||
    isMobile ||
    isAiChatPath(location.pathname) ||
    isInboxPath(location.pathname) ||
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
