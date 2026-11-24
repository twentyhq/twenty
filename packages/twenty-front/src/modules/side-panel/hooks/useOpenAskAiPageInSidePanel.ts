import { aiChatUISessionStartTimeState } from '@/ai-chat/states/aiChatUISessionStartTimeState';
import { askAiSidePanelThreadIdComponentState } from '@/side-panel/states/askAiSidePanelThreadIdComponentState';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { Temporal } from 'temporal-polyfill';
import { SidePanelPages } from 'twenty-shared/types';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { IconSparkles } from 'twenty-ui/icon';
import { v4 } from 'uuid';
import { isSidePanelShrinkingFromFullWidthState } from '@/side-panel/states/isSidePanelShrinkingFromFullWidthState';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

export const useOpenAskAiPageInSidePanel = () => {
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const setAiChatUISessionStartTime = useSetAtomState(
    aiChatUISessionStartTimeState,
  );
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );

  const openAskAiPage = useCallback(
    ({
      threadId,
      resetNavigationStack,
      isContinuedFromFullWidth = false,
    }: {
      threadId?: string;
      resetNavigationStack?: boolean;
      isContinuedFromFullWidth?: boolean;
    } = {}) => {
      if (isWorkspaceSuspended || isCurrentPathAiChatPage()) {
        return;
      }

      const shouldReset =
        resetNavigationStack !== undefined
          ? resetNavigationStack
          : isSidePanelOpened;

      setAiChatUISessionStartTime(
        (aiChatUISessionStartTime) =>
          aiChatUISessionStartTime ?? Temporal.Now.instant(),
      );

      store.set(
        isSidePanelShrinkingFromFullWidthState.atom,
        isContinuedFromFullWidth,
      );

      const pageId = v4();

      store.set(
        askAiSidePanelThreadIdComponentState.atomFamily({ instanceId: pageId }),
        threadId ?? null,
      );

      navigateSidePanelMenu({
        page: SidePanelPages.AskAI,
        pageTitle: t`Ask AI`,
        pageIcon: IconSparkles,
        pageId,
        resetNavigationStack: shouldReset,
      });
    },
    [
      navigateSidePanelMenu,
      isSidePanelOpened,
      setAiChatUISessionStartTime,
      isWorkspaceSuspended,
      store,
    ],
  );

  return {
    openAskAiPage,
  };
};
