import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useRecordsFieldVisibleGqlFields } from '@/object-record/record-field/hooks/useRecordsFieldVisibleGqlFields';

import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useTriggerFetchPages } from '@/object-record/record-table/virtualization/hooks/useTriggerFetchPages';
import { dataLoadingStatusByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/dataLoadingStatusByRealIndexComponentFamilyState';
import { dataPagesLoadedComponentState } from '@/object-record/record-table/virtualization/states/dataPagesLoadedComponentState';
import { recordIdByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilyState';
import { tableHasAnyFilterOrSortComponentSelector } from '@/object-record/record-table/virtualization/states/tableHasAnyFilterOrSortComponentSelector';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { type ObjectOperation } from '@/object-record/states/objectOperationsByObjectNameSingularFamilyState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';

export const useResetVirtualizationBecauseDataChanged = (
  objectNameSingular: string,
) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const params = useFindManyRecordIndexTableParams(objectNameSingular);

  // TODO: we could optimize this by using an aggregate or using only id: true in recordGqlFields
  const recordGqlFields = useRecordsFieldVisibleGqlFields({
    objectMetadataItem,
  });

  const { findManyRecordsLazy } = useLazyFindManyRecords({
    ...params,
    recordGqlFields,
    fetchPolicy: 'network-only',
    limit: 1,
  });

  const totalNumberOfRecordsToVirtualizeCallbackState =
    useRecoilComponentCallbackState(
      totalNumberOfRecordsToVirtualizeComponentState,
    );

  const dataPagesLoadedCallbackState = useRecoilComponentCallbackState(
    dataPagesLoadedComponentState,
  );

  const recordIdByRealIndexCallbackState =
    useRecoilComponentFamilyCallbackState(
      recordIdByRealIndexComponentFamilyState,
    );

  const dataLoadingStatusByRealIndexCallbackState =
    useRecoilComponentCallbackState(
      dataLoadingStatusByRealIndexComponentFamilyState,
    );

  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackState(
    recordIndexAllRecordIdsComponentSelector,
  );

  const { triggerFetchPagesWithoutDebounce } = useTriggerFetchPages();

  const resetVirtualization = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        const { totalCount } = await findManyRecordsLazy();

        const currentRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsSelector,
        );

        for (const [index] of currentRecordIds.entries()) {
          set(
            dataLoadingStatusByRealIndexCallbackState({
              realIndex: index,
            }),
            null,
          );

          set(
            recordIdByRealIndexCallbackState({
              realIndex: index,
            }),
            null,
          );
        }

        set(
          recordIndexAllRecordIdsSelector,
          currentRecordIds.slice(0, totalCount),
        );
        set(dataPagesLoadedCallbackState, []);
        set(totalNumberOfRecordsToVirtualizeCallbackState, totalCount);
      },
    [
      dataPagesLoadedCallbackState,
      recordIdByRealIndexCallbackState,
      dataLoadingStatusByRealIndexCallbackState,
      recordIndexAllRecordIdsSelector,
      findManyRecordsLazy,
      totalNumberOfRecordsToVirtualizeCallbackState,
    ],
  );

  const tableHasAnyFilterOrSort = useRecoilComponentValue(
    tableHasAnyFilterOrSortComponentSelector,
  );

  const resetVirtualizationBecauseDataChanged = useCallback(
    async (objectOperation: ObjectOperation) => {
      if (objectOperation.data.type !== 'update-one') {
        await resetVirtualization();

        await triggerFetchPagesWithoutDebounce();
      } else {
        if (tableHasAnyFilterOrSort) {
          await resetVirtualization();

          await triggerFetchPagesWithoutDebounce();
        }
      }
    },
    [
      resetVirtualization,
      triggerFetchPagesWithoutDebounce,
      tableHasAnyFilterOrSort,
    ],
  );

  return {
    resetVirtualizationBecauseDataChanged,
    resetVirtualization,
  };
};
