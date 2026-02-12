import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { viewableRichTextComponentState } from '@/command-menu/pages/rich-text-page/states/viewableRichTextComponentState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';
import { IconPencil } from 'twenty-ui/display';

export const useRichTextCommandMenu = () => {
  const { navigateCommandMenu, openCommandMenu } = useCommandMenu();

  const openRichTextInCommandMenu = useRecoilCallback(
    ({ set }) =>
      ({
        activityId,
        activityObjectNameSingular,
      }: {
        activityId: string;
        activityObjectNameSingular: string;
      }) => {
        set(viewableRichTextComponentState, {
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
