import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type Location, useNavigate } from 'react-router-dom';
import { getAppPath } from 'twenty-shared/utils';

import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { shouldOpenAiChatAfterOnboardingState } from '@/ai-chat/states/shouldOpenAiChatAfterOnboardingState';
import { getAiChatPageRoute } from '@/ai-chat/utils/getAiChatPageRoute';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { hasOpenedWorkspaceSetupChatSidePanelState } from '@/onboarding/states/hasOpenedWorkspaceSetupChatSidePanelState';
import { getWorkspaceSetupChatSidePanelAction } from '@/onboarding/utils/getWorkspaceSetupChatSidePanelAction';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useOpenWorkspaceSetupChatInSidePanel = () => {
  const store = useStore();
  const navigate = useNavigate();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  const openWorkspaceSetupChatInSidePanel = useCallback(
    (location: Pick<Location, 'pathname'>) => {
      const newAiChatPageRoute = getAiChatPageRoute({
        isInbox: isAiChatInboxEnabled,
        threadId: null,
      });
      const action = getWorkspaceSetupChatSidePanelAction({
        pathname: location.pathname,
        isWorkspaceSetupChatPending: store.get(
          shouldOpenAiChatAfterOnboardingState.atom,
        ),
        hasOpenedWorkspaceSetupChatSidePanel: store.get(
          hasOpenedWorkspaceSetupChatSidePanelState.atom,
        ),
        defaultHomePagePath,
        newAiChatPagePath: getAppPath(newAiChatPageRoute.appPath, {
          threadId: newAiChatPageRoute.threadId,
        }),
        newAiChatThreadId: store.get(newAiChatThreadIdState.atom),
      });

      if (action.type === 'none') {
        return false;
      }

      if (action.type === 'redirect') {
        navigate(action.path, { replace: true });

        return false;
      }

      store.set(hasOpenedWorkspaceSetupChatSidePanelState.atom, true);

      if (!action.shouldOpenAskAi) {
        return false;
      }

      openAskAiPage({ resetNavigationStack: true });

      return true;
    },
    [defaultHomePagePath, isAiChatInboxEnabled, navigate, openAskAiPage, store],
  );

  return { openWorkspaceSetupChatInSidePanel };
};
