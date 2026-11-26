import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { useStore } from 'jotai';

import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { getAiChatPageRoute } from '@/ai-chat/utils/getAiChatPageRoute';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { checkIfFeatureFlagIsEnabledOnWorkspace } from '@/workspace/utils/checkIfFeatureFlagIsEnabledOnWorkspace';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

export const useNavigateToAiChatPage = () => {
  const store = useStore();
  const navigate = useNavigateApp();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const navigateToAiChatPage = ({
    threadId,
  }: {
    threadId?: string | null;
  } = {}) => {
    if (
      store.get(isLayoutCustomizationModeEnabledState.atom) ||
      isCurrentPathAiChatPage()
    ) {
      return;
    }

    void closeSidePanelMenu();

    const isNewChat = threadId === store.get(newAiChatThreadIdState.atom);

    const aiChatPageRoute = getAiChatPageRoute({
      isInbox: checkIfFeatureFlagIsEnabledOnWorkspace(
        FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
        store.get(currentWorkspaceState.atom),
      ),
      threadId:
        isDefined(threadId) && isValidUuid(threadId) && !isNewChat
          ? threadId
          : null,
    });

    navigate(
      aiChatPageRoute.appPath,
      { threadId: aiChatPageRoute.threadId },
      undefined,
      {
        state: {
          returnLocation: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        },
      },
    );
  };

  return { navigateToAiChatPage };
};
