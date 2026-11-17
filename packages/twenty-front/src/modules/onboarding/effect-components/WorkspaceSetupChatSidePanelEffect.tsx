import { useLayoutEffect } from 'react';
import { useStore } from 'jotai';

import { hasOpenedWorkspaceSetupChatSidePanelState } from '@/onboarding/states/hasOpenedWorkspaceSetupChatSidePanelState';
import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';
import { aiChatContinueInSidePanelThreadIdState } from '@/ai/states/aiChatContinueInSidePanelThreadIdState';
import { getCurrentAiChatPageThreadId } from '@/ai/utils/getCurrentAiChatPageThreadId';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { Navigate, useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isSettingsPath } from '~/utils/isSettingsPath';

export const WorkspaceSetupChatSidePanelEffect = () => {
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );
  const store = useStore();
  const { pathname } = useLocation();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const newAiChatPagePath = isAiChatInboxEnabled
    ? getAppPath(AppPath.AiChatInbox, {
        threadId: AI_CHAT_NEW_THREAD_PATH_SEGMENT,
      })
    : getAppPath(AppPath.AiChat, { threadId: null });

  useLayoutEffect(() => {
    if (!shouldOpenAiChatAfterOnboarding) {
      store.set(hasOpenedWorkspaceSetupChatSidePanelState.atom, false);
      return;
    }

    if (
      store.get(hasOpenedWorkspaceSetupChatSidePanelState.atom) ||
      isDefined(getCurrentAiChatPageThreadId(store)) ||
      isSettingsPath(pathname) ||
      isDefined(store.get(aiChatContinueInSidePanelThreadIdState.atom))
    ) {
      return;
    }

    store.set(hasOpenedWorkspaceSetupChatSidePanelState.atom, true);
    openAskAiPage({ resetNavigationStack: true });
  }, [shouldOpenAiChatAfterOnboarding, store, pathname, openAskAiPage]);

  if (
    shouldOpenAiChatAfterOnboarding &&
    !store.get(hasOpenedWorkspaceSetupChatSidePanelState.atom) &&
    !isDefined(store.get(aiChatContinueInSidePanelThreadIdState.atom)) &&
    isSettingsPath(pathname)
  ) {
    return (
      <Navigate
        to={
          isSettingsPath(defaultHomePagePath)
            ? newAiChatPagePath
            : defaultHomePagePath
        }
        replace
      />
    );
  }

  return null;
};
