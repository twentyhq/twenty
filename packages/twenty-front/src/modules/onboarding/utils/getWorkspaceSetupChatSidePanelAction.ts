import { isDefined } from 'twenty-shared/utils';

import { getAiChatPageThreadId } from '@/ai-chat/utils/getAiChatPageThreadId';
import { isSettingsPath } from '~/utils/isSettingsPath';

type WorkspaceSetupChatSidePanelAction =
  | { type: 'none' }
  | { type: 'redirect'; path: string }
  | { type: 'markOpened'; shouldOpenAskAi: boolean };

export const getWorkspaceSetupChatSidePanelAction = ({
  pathname,
  isWorkspaceSetupChatPending,
  hasOpenedWorkspaceSetupChatSidePanel,
  defaultHomePagePath,
  newAiChatPagePath,
  newAiChatThreadId,
}: {
  pathname: string;
  isWorkspaceSetupChatPending: boolean;
  hasOpenedWorkspaceSetupChatSidePanel: boolean;
  defaultHomePagePath: string;
  newAiChatPagePath: string;
  newAiChatThreadId: string;
}): WorkspaceSetupChatSidePanelAction => {
  if (!isWorkspaceSetupChatPending || hasOpenedWorkspaceSetupChatSidePanel) {
    return { type: 'none' };
  }

  if (isSettingsPath(pathname)) {
    return {
      type: 'redirect',
      path: isSettingsPath(defaultHomePagePath)
        ? newAiChatPagePath
        : defaultHomePagePath,
    };
  }

  return {
    type: 'markOpened',
    shouldOpenAskAi: !isDefined(
      getAiChatPageThreadId({ pathname, newAiChatThreadId }),
    ),
  };
};
