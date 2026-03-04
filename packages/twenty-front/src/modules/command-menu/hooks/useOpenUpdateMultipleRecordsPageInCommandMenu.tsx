import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { SidePanelPages } from 'twenty-shared/types';

import { msg, t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { IconBoxMultiple } from 'twenty-ui/display';

type UseOpenUpdateMultipleRecordsPageInCommandMenuProps = {
  contextStoreInstanceId: string;
};

export const useOpenUpdateMultipleRecordsPageInCommandMenu = ({
  contextStoreInstanceId,
}: UseOpenUpdateMultipleRecordsPageInCommandMenuProps) => {
  const { navigateCommandMenu } = useNavigateSidePanel();

  const openUpdateMultipleRecordsPageInCommandMenu = useCallback(async () => {
    navigateCommandMenu({
      page: SidePanelPages.UpdateRecords,
      pageTitle: t(msg`Update records`),
      pageIcon: IconBoxMultiple,
      pageId: contextStoreInstanceId,
    });
  }, [navigateCommandMenu, contextStoreInstanceId]);

  return {
    openUpdateMultipleRecordsPageInCommandMenu,
  };
};
