import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';

import { msg, t } from '@lingui/core/macro';
import { useRecoilCallback } from 'recoil';
import { IconBoxMultiple } from 'twenty-ui/display';

type UseOpenUpdateMultipleRecordsPageInCommandMenuProps = {
  contextStoreInstanceId: string;
};

export const useOpenUpdateMultipleRecordsPageInCommandMenu = ({
  contextStoreInstanceId,
}: UseOpenUpdateMultipleRecordsPageInCommandMenuProps) => {
  const { navigateCommandMenu } = useNavigateCommandMenu();

  const openUpdateMultipleRecordsPageInCommandMenu = useRecoilCallback(() => {
    return async () => {
      navigateCommandMenu({
        page: CommandMenuPages.UpdateRecords,
        pageTitle: t(msg`Update records`),
        pageIcon: IconBoxMultiple,
        pageId: contextStoreInstanceId,
      });
    };
  }, [navigateCommandMenu, contextStoreInstanceId]);

  return {
    openUpdateMultipleRecordsPageInCommandMenu,
  };
};
