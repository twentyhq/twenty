import { hasUserSelectedAllRecordsComponentState } from '@/object-record/record-selection/states/hasUserSelectedAllRecordsComponentState';
import { isTotalNumberOfRowsKnownComponentState } from '@/object-record/record-table/virtualization/states/isTotalNumberOfRowsKnownComponentState';
import { recordTableDataGenerationComponentState } from '@/object-record/record-table/virtualization/states/recordTableDataGenerationComponentState';
import { getRecordTableRowExtent } from '@/object-record/record-table/virtualization/utils/getRecordTableRowExtent';
import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useAllocateRowSlots } from '@/object-record/record-table/virtualization/hooks/useAllocateRowSlots';
import { useTriggerFetchPages } from '@/object-record/record-table/virtualization/hooks/useTriggerFetchPages';
import { lastScrollPositionComponentState } from '@/object-record/record-table/virtualization/states/lastScrollPositionComponentState';
import { totalNumberOfRowsComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRowsComponentState';
import { keepRecordIdsInRowIndexRange } from '@/object-record/record-table/virtualization/utils/keepRecordIdsInRowIndexRange';
import { getVirtualizationOverscanWindow } from '@/object-record/record-table/virtualization/utils/getVirtualizationOverscanWindow';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { sleep } from '~/utils/sleep';

export const useResetVirtualizationBecauseDataChanged = (
  objectNameSingular: string,
) => {
  const store = useStore();
  const hasUserSelectedAllRecordsCallbackState =
    useAtomComponentStateCallbackState(hasUserSelectedAllRecordsComponentState);
  const recordTableDataGenerationCallbackState =
    useAtomComponentStateCallbackState(recordTableDataGenerationComponentState);
  const isTotalNumberOfRowsKnownCallbackState =
    useAtomComponentStateCallbackState(isTotalNumberOfRowsKnownComponentState);
  const { recordLimit } = useRecordIndexContextOrThrow();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  const params = useFindManyRecordIndexTableParams(objectNameSingular);

  const recordGqlFields = useRelevantRecordsGqlFields({
    objectMetadataItem,
  });

  const { findManyRecordsLazy } = useLazyFindManyRecords({
    ...params,
    recordGqlFields,
    fetchPolicy: 'network-only',
    limit: 1,
    allowMissingTotalCountOnTimeout: true,
  });

  const totalNumberOfRowsCallbackState = useAtomComponentStateCallbackState(
    totalNumberOfRowsComponentState,
  );

  const lastScrollPositionCallbackState = useAtomComponentStateCallbackState(
    lastScrollPositionComponentState,
  );

  const recordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const { allocateRowSlots } = useAllocateRowSlots();

  const { triggerFetchPagesWithoutDebounce } = useTriggerFetchPages();

  const resetVirtualizationBecauseDataChanged = useCallback(async () => {
    const generation = store.get(recordTableDataGenerationCallbackState) + 1;
    store.set(recordTableDataGenerationCallbackState, generation);
    const result = await findManyRecordsLazy();
    if (store.get(recordTableDataGenerationCallbackState) !== generation) {
      return;
    }
    const extent = getRecordTableRowExtent({
      totalCount: result.isTotalCountKnown ? result.totalCount : undefined,
      numberOfRecords: result.records?.length ?? 0,
      hasNextPage: result.hasNextPage,
      recordLimit,
      previousExtent: store.get(totalNumberOfRowsCallbackState) ?? 0,
    });
    const totalCount = extent.totalNumberOfRows;
    store.set(isTotalNumberOfRowsKnownCallbackState, extent.isTotalCountKnown);
    if (!extent.isTotalCountKnown) {
      store.set(hasUserSelectedAllRecordsCallbackState, false);
    }

    const { firstRowIndexInOverscanWindow, lastRowIndexInOverscanWindow } =
      getVirtualizationOverscanWindow({
        scrollPosition: store.get(lastScrollPositionCallbackState),
        scrollWrapperHeight:
          getScrollWrapperElement().scrollWrapperElement?.clientHeight ?? 0,
        totalNumberOfRows: store.get(totalNumberOfRowsCallbackState) ?? 0,
      });

    const recordIdsCallbackState = recordIdsByGroupCallbackState(
      NO_RECORD_GROUP_FAMILY_KEY,
    );

    store.set(
      recordIdsCallbackState,
      keepRecordIdsInRowIndexRange({
        recordIdsByRowIndex: store.get(recordIdsCallbackState),
        firstRowIndex: firstRowIndexInOverscanWindow,
        lastRowIndex: Math.min(lastRowIndexInOverscanWindow, totalCount - 1),
      }),
    );
    store.set(totalNumberOfRowsCallbackState, totalCount);

    allocateRowSlots();

    await sleep(50);

    await triggerFetchPagesWithoutDebounce({ shouldRefetchLoadedPages: true });
  }, [
    allocateRowSlots,
    findManyRecordsLazy,
    recordLimit,
    lastScrollPositionCallbackState,
    recordIdsByGroupCallbackState,
    getScrollWrapperElement,
    store,
    totalNumberOfRowsCallbackState,
    triggerFetchPagesWithoutDebounce,
    hasUserSelectedAllRecordsCallbackState,
    recordTableDataGenerationCallbackState,
    isTotalNumberOfRowsKnownCallbackState,
  ]);

  return { resetVirtualizationBecauseDataChanged };
};
