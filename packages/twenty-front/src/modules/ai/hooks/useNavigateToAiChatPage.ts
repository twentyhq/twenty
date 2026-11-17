import { AppPath } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { useStore } from 'jotai';

import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

export const useNavigateToAiChatPage = () => {
  const store = useStore();
  const navigate = useNavigateApp();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

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

    const newChatPathSegment = isAiChatInboxEnabled
      ? AI_CHAT_NEW_THREAD_PATH_SEGMENT
      : null;

    navigate(
      isAiChatInboxEnabled ? AppPath.AiChatInbox : AppPath.AiChat,
      {
        threadId:
          isDefined(threadId) && isValidUuid(threadId)
            ? threadId
            : newChatPathSegment,
      },
      undefined,
      {
        state: {
          // Read from the window rather than useLocation so that opening a new
          // chat does not require a router context from every caller of
          // useSwitchToNewAiChat, front components included.
          returnLocation: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        },
      },
    );
  };

  return { navigateToAiChatPage };
};
