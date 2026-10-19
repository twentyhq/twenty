import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useAllocateRowSlots } from '@/object-record/record-table/virtualization/hooks/useAllocateRowSlots';
import { useTriggerFetchPages } from '@/object-record/record-table/virtualization/hooks/useTriggerFetchPages';
import { lastScrollPositionComponentState } from '@/object-record/record-table/virtualization/states/lastScrollPositionComponentState';
import { totalNumberOfRowsComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRowsComponentState';
import { getVirtualizationOverscanWindow } from '@/object-record/record-table/virtualization/utils/getVirtualizationOverscanWindow';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { sleep } from '~/utils/sleep';

export const useResetVirtualizationBecauseDataChanged = (
  objectNameSingular: string,
) => {
  const store = useStore();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const params = useFindManyRecordIndexTableParams(objectNameSingular);

  const recordGqlFields = useRelevantRecordsGqlFields({
    objectMetadataItem,
  });

  const { findManyRecordsLazy } = useLazyFindManyRecords({
    ...params,
    recordGqlFields,
    fetchPolicy: 'network-only',
    limit: 1,
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
    const { totalCount } = await findManyRecordsLazy();

    const { firstRowIndexInOverscanWindow, lastRowIndexInOverscanWindow } =
      getVirtualizationOverscanWindow(
        store.get(lastScrollPositionCallbackState),
        scrollWrapperHTMLElement?.clientHeight ?? 0,
        store.get(totalNumberOfRowsCallbackState) ?? 0,
      );

    const recordIdsCallbackState = recordIdsByGroupCallbackState(
      NO_RECORD_GROUP_FAMILY_KEY,
    );

    const recordIds = store.get(recordIdsCallbackState);
    const recordIdsInOverscanWindow: string[] = [];

    for (
      let rowIndex = firstRowIndexInOverscanWindow;
      rowIndex <= lastRowIndexInOverscanWindow;
      rowIndex++
    ) {
      if (rowIndex in recordIds) {
        recordIdsInOverscanWindow[rowIndex] = recordIds[rowIndex];
      }
    }

    store.set(recordIdsCallbackState, recordIdsInOverscanWindow);
    store.set(totalNumberOfRowsCallbackState, totalCount);

    allocateRowSlots();

    await sleep(50);

    await triggerFetchPagesWithoutDebounce({ shouldRefetchLoadedPages: true });
  }, [
    allocateRowSlots,
    findManyRecordsLazy,
    lastScrollPositionCallbackState,
    recordIdsByGroupCallbackState,
    scrollWrapperHTMLElement?.clientHeight,
    store,
    totalNumberOfRowsCallbackState,
    triggerFetchPagesWithoutDebounce,
  ]);

  return { resetVirtualizationBecauseDataChanged };
};
