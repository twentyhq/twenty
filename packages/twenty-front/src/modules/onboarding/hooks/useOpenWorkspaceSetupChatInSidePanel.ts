import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type Location, useNavigate } from 'react-router-dom';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { shouldOpenAiChatAfterOnboardingState } from '@/ai-chat/states/shouldOpenAiChatAfterOnboardingState';
import { getAiChatPageRoute } from '@/ai-chat/utils/getAiChatPageRoute';
import { getAiChatPageThreadId } from '@/ai-chat/utils/getAiChatPageThreadId';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { hasOpenedWorkspaceSetupChatSidePanelState } from '@/onboarding/states/hasOpenedWorkspaceSetupChatSidePanelState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { isSettingsPath } from '~/utils/isSettingsPath';

export const useOpenWorkspaceSetupChatInSidePanel = () => {
  const store = useStore();
  const navigate = useNavigate();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  const openWorkspaceSetupChatInSidePanel = useCallback(
    ({ pathname }: Pick<Location, 'pathname'>) => {
      if (
        !store.get(shouldOpenAiChatAfterOnboardingState.atom) ||
        store.get(hasOpenedWorkspaceSetupChatSidePanelState.atom)
      ) {
        return false;
      }

      if (isSettingsPath(pathname)) {
        const newAiChatPageRoute = getAiChatPageRoute({
          isInbox: isAiChatInboxEnabled,
          threadId: null,
        });

        navigate(
          isSettingsPath(defaultHomePagePath)
            ? getAppPath(newAiChatPageRoute.appPath, {
                threadId: newAiChatPageRoute.threadId,
              })
            : defaultHomePagePath,
          { replace: true },
        );

        return false;
      }

      store.set(hasOpenedWorkspaceSetupChatSidePanelState.atom, true);

      const isAiChatPageShown = isDefined(
        getAiChatPageThreadId({
          pathname,
          newAiChatThreadId: store.get(newAiChatThreadIdState.atom),
        }),
      );

      if (isAiChatPageShown) {
        return false;
      }

      openAskAiPage({ resetNavigationStack: true });

      return true;
    },
    [defaultHomePagePath, isAiChatInboxEnabled, navigate, openAskAiPage, store],
  );

  return { openWorkspaceSetupChatInSidePanel };
};
