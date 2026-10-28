import { useSidePanelUpdateNavigationMorphItemsByPage } from '@/side-panel/hooks/useSidePanelUpdateNavigationMorphItemsByPage';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { mergeSettingsState } from '@/object-record/record-merge/states/mergeSettingsState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { msg, t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { IconArrowMerge } from 'twenty-ui/icon';
import { v4 } from 'uuid';
import { useStore } from 'jotai';

type UseOpenMergeRecordsPageInSidePanelProps = {
  objectNameSingular: string;
};

export const useOpenMergeRecordsPageInSidePanel = ({
  objectNameSingular,
}: UseOpenMergeRecordsPageInSidePanelProps) => {
  const store = useStore();
  const apolloCoreClient = useApolloCoreClient();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { navigateSidePanel } = useNavigateSidePanel();
  const { updateSidePanelNavigationMorphItemsByPage } =
    useSidePanelUpdateNavigationMorphItemsByPage();

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular,
  });

  // The first record is the default priority record
  const openMergeRecordsPageInSidePanel = useCallback(
    async (objectRecordIds: string[]) => {
      const pageId = v4();

      store.set(
        contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        objectMetadataItem.id,
      );

      store.set(mergeSettingsState.atom, { conflictPriorityIndex: 0 });

      await updateSidePanelNavigationMorphItemsByPage({
        pageId,
        objectMetadataId: objectMetadataItem.id,
        objectRecordIds,
      });

      const { data } =
        await apolloCoreClient.query<RecordGqlOperationFindManyResult>({
          query: findManyRecordsQuery,
          variables: { filter: { id: { in: objectRecordIds } } },
        });
      const recordConnection = data?.[objectMetadataItem.namePlural];

      if (isDefined(recordConnection)) {
        upsertRecordsInStore({
          partialRecords: getRecordsFromRecordConnection({ recordConnection }),
        });
      }

      navigateSidePanel({
        page: SidePanelPages.MergeRecords,
        pageTitle: t(msg`Merge records`),
        pageIcon: IconArrowMerge,
        pageId,
      });
    },
    [
      objectMetadataItem.id,
      objectMetadataItem.namePlural,
      apolloCoreClient,
      findManyRecordsQuery,
      upsertRecordsInStore,
      navigateSidePanel,
      updateSidePanelNavigationMorphItemsByPage,
      store,
    ],
  );

  return {
    openMergeRecordsPageInSidePanel,
  };
};
