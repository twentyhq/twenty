import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { recordViewsTargetComponentState } from '@/side-panel/pages/record-views/states/recordViewsTargetComponentState';
import { type RecordViewsTarget } from '@/side-panel/pages/record-views/types/RecordViewsTarget';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconArrowUpRight } from 'twenty-ui/icon';
import { v4 } from 'uuid';

export const useOpenRecordViewsPageInSidePanel = () => {
  const store = useStore();
  const { navigateSidePanel } = useNavigateSidePanel();

  const openRecordViewsPageInSidePanel = useCallback(
    (targetRecord: RecordViewsTarget) => {
      const pageId = v4();

      store.set(
        recordViewsTargetComponentState.atomFamily({ instanceId: pageId }),
        targetRecord,
      );
      navigateSidePanel({
        page: SidePanelPages.RecordViews,
        pageTitle: t`See in view…`,
        pageIcon: IconArrowUpRight,
        pageId,
      });
    },
    [navigateSidePanel, store],
  );

  return { openRecordViewsPageInSidePanel };
};
