import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { SidePanelPages } from 'twenty-shared/types';

import { msg } from '@lingui/core/macro';
import { useCallback } from 'react';
import { IconBoxMultiple } from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';

type UseOpenUpdateMultipleRecordsPageInSidePanelProps = {
  contextStoreInstanceId: string;
};

export const useOpenUpdateMultipleRecordsPageInSidePanel = ({
  contextStoreInstanceId,
}: UseOpenUpdateMultipleRecordsPageInSidePanelProps) => {
  const { t } = useLingui();
  const { navigateSidePanel } = useNavigateSidePanel();

  const openUpdateMultipleRecordsPageInSidePanel = useCallback(async () => {
    navigateSidePanel({
      page: SidePanelPages.UpdateRecords,
      pageTitle: t(msg`Update records`),
      pageIcon: IconBoxMultiple,
      pageId: contextStoreInstanceId,
    });
  }, [navigateSidePanel, contextStoreInstanceId, t]);

  return {
    openUpdateMultipleRecordsPageInSidePanel,
  };
};
