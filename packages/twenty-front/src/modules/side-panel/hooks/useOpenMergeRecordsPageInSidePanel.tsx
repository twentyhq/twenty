import { useSidePanelUpdateNavigationMorphItemsByPage } from '@/side-panel/hooks/useSidePanelUpdateNavigationMorphItemsByPage';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { SidePanelPages } from 'twenty-shared/types';

import { msg, t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { IconArrowMerge } from 'twenty-ui/display';
import { v4 } from 'uuid';
import { useStore } from 'jotai';

type UseOpenMergeRecordsPageInSidePanelProps = {
  objectNameSingular: string;
  objectRecordIds: string[];
};

export const useOpenMergeRecordsPageInSidePanel = ({
  objectNameSingular,
  objectRecordIds,
}: UseOpenMergeRecordsPageInSidePanelProps) => {
  const store = useStore();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { navigateSidePanel } = useNavigateSidePanel();
  const { updateSidePanelNavigationMorphItemsByPage } =
    useSidePanelUpdateNavigationMorphItemsByPage();

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const { findManyRecordsLazy } = useLazyFindManyRecords({
    objectNameSingular,
    filter: {
      id: {
        in: objectRecordIds,
      },
    },
  });

  const openMergeRecordsPageInSidePanel = useCallback(async () => {
    const pageId = v4();

    store.set(
      contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
        instanceId: pageId,
      }),
      objectMetadataItem.id,
    );

    await updateSidePanelNavigationMorphItemsByPage({
      pageId,
      objectMetadataId: objectMetadataItem.id,
      objectRecordIds,
    });
    const { records } = await findManyRecordsLazy();
    upsertRecordsInStore({ partialRecords: records ?? [] });

    navigateSidePanel({
      page: SidePanelPages.MergeRecords,
      pageTitle: t(msg`Merge records`),
      pageIcon: IconArrowMerge,
      pageId,
    });
  }, [
    objectMetadataItem.id,
    objectRecordIds,
    findManyRecordsLazy,
    upsertRecordsInStore,
    navigateSidePanel,
    updateSidePanelNavigationMorphItemsByPage,
    store,
  ]);

  return {
    openMergeRecordsPageInSidePanel,
  };
};
