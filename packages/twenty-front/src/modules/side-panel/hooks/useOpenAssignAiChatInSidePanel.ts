import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconUsers } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { assignAiChatThreadIdsComponentState } from '@/side-panel/states/assignAiChatThreadIdsComponentState';
import { shouldGoBackAfterAssignAiChatComponentState } from '@/side-panel/states/shouldGoBackAfterAssignAiChatComponentState';

export const useOpenAssignAiChatInSidePanel = () => {
  const { t } = useLingui();
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openAssignAiChatInSidePanel = useCallback(
    ({
      threadIds,
      shouldGoBackAfterAssign = false,
    }: {
      threadIds: string[];
      shouldGoBackAfterAssign?: boolean;
    }) => {
      const pageId = v4();

      store.set(
        assignAiChatThreadIdsComponentState.atomFamily({ instanceId: pageId }),
        threadIds,
      );
      store.set(
        shouldGoBackAfterAssignAiChatComponentState.atomFamily({
          instanceId: pageId,
        }),
        shouldGoBackAfterAssign,
      );

      navigateSidePanelMenu({
        page: SidePanelPages.AssignAiChat,
        pageTitle: t`Assign`,
        pageIcon: IconUsers,
        pageId,
      });
    },
    [navigateSidePanelMenu, store, t],
  );

  return { openAssignAiChatInSidePanel };
};
