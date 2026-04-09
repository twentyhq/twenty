import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { SidePanelPages } from 'twenty-shared/types';

import { msg, t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { IconTag } from 'twenty-ui/display';

type UseOpenTagSelectedPageInSidePanelProps = {
  contextStoreInstanceId: string;
};

export const useOpenTagSelectedPageInSidePanel = ({
  contextStoreInstanceId,
}: UseOpenTagSelectedPageInSidePanelProps) => {
  const { navigateSidePanel } = useNavigateSidePanel();

  const openTagSelectedPageInSidePanel = useCallback(async () => {
    navigateSidePanel({
      page: SidePanelPages.TagSelectedRecords,
      pageTitle: t(msg`Tag records`),
      pageIcon: IconTag,
      pageId: contextStoreInstanceId,
    });
  }, [navigateSidePanel, contextStoreInstanceId]);

  return {
    openTagSelectedPageInSidePanel,
  };
};
