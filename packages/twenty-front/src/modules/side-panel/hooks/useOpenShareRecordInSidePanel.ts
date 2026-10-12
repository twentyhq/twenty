import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconShare } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { shareRecordTargetComponentState } from '@/side-panel/pages/share-record/states/shareRecordTargetComponentState';

export const useOpenShareRecordInSidePanel = () => {
  const { t } = useLingui();
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openShareRecordInSidePanel = useCallback(
    ({
      objectMetadataItem,
      recordId,
    }: {
      objectMetadataItem: EnrichedObjectMetadataItem;
      recordId: string;
    }) => {
      const pageId = v4();
      const objectLabel = objectMetadataItem.labelSingular;

      store.set(
        shareRecordTargetComponentState.atomFamily({ instanceId: pageId }),
        {
          objectMetadataId: objectMetadataItem.id,
          recordId,
        },
      );

      navigateSidePanelMenu({
        page: SidePanelPages.ShareRecord,
        pageTitle: t`Share ${objectLabel}`,
        pageIcon: IconShare,
        pageId,
      });
    },
    [navigateSidePanelMenu, store, t],
  );

  return { openShareRecordInSidePanel };
};
