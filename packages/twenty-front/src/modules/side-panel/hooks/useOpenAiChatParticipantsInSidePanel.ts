import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconUserPlus, IconUsers } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { aiChatParticipantsThreadIdComponentState } from '@/side-panel/states/aiChatParticipantsThreadIdComponentState';

export const useOpenAiChatParticipantsInSidePanel = () => {
  const { t } = useLingui();
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openAiChatParticipantsInSidePanel = useCallback(
    ({
      threadId,
      page,
    }: {
      threadId: string;
      page:
        | SidePanelPages.AiChatParticipants
        | SidePanelPages.AddAiChatParticipants;
    }) => {
      const pageId = v4();
      const isAddPage = page === SidePanelPages.AddAiChatParticipants;

      store.set(
        aiChatParticipantsThreadIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        threadId,
      );

      navigateSidePanelMenu({
        page,
        pageTitle: isAddPage ? t`Add participants` : t`Participants`,
        pageIcon: isAddPage ? IconUserPlus : IconUsers,
        pageId,
      });
    },
    [navigateSidePanelMenu, store, t],
  );

  return { openAiChatParticipantsInSidePanel };
};
