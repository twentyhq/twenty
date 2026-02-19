import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { viewableRichTextComponentStateV2 } from '@/command-menu/pages/rich-text-page/states/viewableRichTextComponentStateV2';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useStore } from 'jotai';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { IconPencil } from 'twenty-ui/display';

export const useRichTextCommandMenu = () => {
  const { navigateCommandMenu, openCommandMenu } = useCommandMenu();

  const store = useStore();

  const openRichTextInCommandMenu = useCallback(
    ({
      activityId,
      activityObjectNameSingular,
    }: {
      activityId: string;
      activityObjectNameSingular: string;
    }) => {
      store.set(viewableRichTextComponentStateV2.atom, {
        activityId,
        activityObjectNameSingular,
      });

      openCommandMenu();
      navigateCommandMenu({
        page: CommandMenuPages.EditRichText,
        pageTitle: t`Rich Text`,
        pageIcon: IconPencil,
      });
    },
    [navigateCommandMenu, openCommandMenu, store],
  );

  const editRichText = useCallback(
    (activityId: string, activityObjectNameSingular: string) => {
      openRichTextInCommandMenu({ activityId, activityObjectNameSingular });
    },
    [openRichTextInCommandMenu],
  );

  return {
    editRichText,
  };
};
