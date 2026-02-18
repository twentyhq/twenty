import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { viewableRichTextComponentStateV2 } from '@/command-menu/pages/rich-text-page/states/viewableRichTextComponentStateV2';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { IconPencil } from 'twenty-ui/display';

export const useRichTextCommandMenu = () => {
  const { navigateCommandMenu, openCommandMenu } = useCommandMenu();

  const openRichTextInCommandMenu = useCallback(
    ({
      activityId,
      activityObjectNameSingular,
    }: {
      activityId: string;
      activityObjectNameSingular: string;
    }) => {
      jotaiStore.set(viewableRichTextComponentStateV2.atom, {
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
    [navigateCommandMenu, openCommandMenu],
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
