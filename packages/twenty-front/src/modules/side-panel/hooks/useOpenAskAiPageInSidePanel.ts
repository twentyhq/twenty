import { agentChatUISessionStartTimeState } from '@/ai/states/agentChatUISessionStartTimeState';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { Temporal } from 'temporal-polyfill';
import { SidePanelPages } from 'twenty-shared/types';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { IconSparkles } from 'twenty-ui/icon';
import { v4 } from 'uuid';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

export const useOpenAskAiPageInSidePanel = () => {
  const { navigateSidePanelMenu } = useSidePanelMenu();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const setAgentChatUISessionStartTime = useSetAtomState(
    agentChatUISessionStartTimeState,
  );
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );

  const openAskAiPage = useCallback(
    ({
      resetNavigationStack,
    }: {
      resetNavigationStack?: boolean;
    } = {}) => {
      if (isWorkspaceSuspended || isCurrentPathAiChatPage()) {
        return;
      }

      const shouldReset =
        resetNavigationStack !== undefined
          ? resetNavigationStack
          : isSidePanelOpened;

      setAgentChatUISessionStartTime(
        (agentChatUISessionStartTime) =>
          agentChatUISessionStartTime ?? Temporal.Now.instant(),
      );

      navigateSidePanelMenu({
        page: SidePanelPages.AskAI,
        pageTitle: t`Ask AI`,
        pageIcon: IconSparkles,
        pageId: v4(),
        resetNavigationStack: shouldReset,
      });
    },
    [
      navigateSidePanelMenu,
      isSidePanelOpened,
      setAgentChatUISessionStartTime,
      isWorkspaceSuspended,
    ],
  );

  return {
    openAskAiPage,
  };
};
