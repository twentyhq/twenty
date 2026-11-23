import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { type IconComponent, IconUserPlus, IconUsers } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { aiChatParticipantsThreadIdComponentState } from '@/side-panel/states/aiChatParticipantsThreadIdComponentState';

export const useOpenAiChatParticipantsInSidePanel = () => {
  const { t } = useLingui();
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openPage = useCallback(
    ({
      threadId,
      page,
      pageTitle,
      pageIcon,
    }: {
      threadId: string;
      page:
        | SidePanelPages.AiChatParticipants
        | SidePanelPages.AddAiChatParticipants;
      pageTitle: string;
      pageIcon: IconComponent;
    }) => {
      const pageId = v4();

      store.set(
        aiChatParticipantsThreadIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        threadId,
      );

      navigateSidePanelMenu({ page, pageTitle, pageIcon, pageId });
    },
    [navigateSidePanelMenu, store],
  );

  const openAiChatParticipantsInSidePanel = useCallback(
    (threadId: string) =>
      openPage({
        threadId,
        page: SidePanelPages.AiChatParticipants,
        pageTitle: t`Participants`,
        pageIcon: IconUsers,
      }),
    [openPage, t],
  );

  const openAddAiChatParticipantsInSidePanel = useCallback(
    (threadId: string) =>
      openPage({
        threadId,
        page: SidePanelPages.AddAiChatParticipants,
        pageTitle: t`Add participants`,
        pageIcon: IconUserPlus,
      }),
    [openPage, t],
  );

  return {
    openAiChatParticipantsInSidePanel,
    openAddAiChatParticipantsInSidePanel,
  };
};
