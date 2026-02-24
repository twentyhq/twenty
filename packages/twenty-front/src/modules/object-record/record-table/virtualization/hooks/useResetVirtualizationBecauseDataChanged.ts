import { useCallback } from 'react';
import { useStore } from 'jotai';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useRecordsFieldVisibleGqlFields } from '@/object-record/record-field/hooks/useRecordsFieldVisibleGqlFields';

import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { useTriggerFetchPages } from '@/object-record/record-table/virtualization/hooks/useTriggerFetchPages';
import { dataLoadingStatusByRealIndexComponentState } from '@/object-record/record-table/virtualization/states/dataLoadingStatusByRealIndexComponentState';
import { dataPagesLoadedComponentState } from '@/object-record/record-table/virtualization/states/dataPagesLoadedComponentState';
import { lastScrollPositionComponentState } from '@/object-record/record-table/virtualization/states/lastScrollPositionComponentState';
import { recordIdByRealIndexComponentState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentState';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { getVirtualizationOverscanWindow } from '@/object-record/record-table/virtualization/utils/getVirtualizationOverscanWindow';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { isDefined } from 'twenty-shared/utils';
import { sleep } from '~/utils/sleep';

export const useResetVirtualizationBecauseDataChanged = (
  objectNameSingular: string,
) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const params = useFindManyRecordIndexTableParams(objectNameSingular);

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
    useRecoilComponentStateCallbackStateV2(
      totalNumberOfRecordsToVirtualizeComponentState,
    );

  const dataPagesLoadedCallbackState = useRecoilComponentStateCallbackStateV2(
    dataPagesLoadedComponentState,
  );

  const { triggerFetchPagesWithoutDebounce } = useTriggerFetchPages();

  const lastScrollPositionCallbackState =
    useRecoilComponentStateCallbackStateV2(lastScrollPositionComponentState);

  const recordIdByRealIndexCallbackState =
    useRecoilComponentStateCallbackStateV2(recordIdByRealIndexComponentState);

  const dataLoadingStatusByRealIndexCallbackState =
    useRecoilComponentStateCallbackStateV2(
      dataLoadingStatusByRealIndexComponentState,
    );

  const store = useStore();

  const resetVirtualization = useCallback(async () => {
    const { totalCount } = await findManyRecordsLazy();

    const tableScrollWrapperHeight =
      scrollWrapperHTMLElement?.clientHeight ?? 0;

    const lastScrollPosition = store.get(lastScrollPositionCallbackState);

    const totalNumberOfRecordsToVirtualize =
      store.get(totalNumberOfRecordsToVirtualizeCallbackState) ?? 0;

    const { firstRealIndexInOverscanWindow, lastRealIndexInOverscanWindow } =
      getVirtualizationOverscanWindow(
        lastScrollPosition,
        tableScrollWrapperHeight,
        totalNumberOfRecordsToVirtualize,
      );

    const recordIdByRealIndex = store.get(recordIdByRealIndexCallbackState);

    const dataLoadingStatusByRealIndex = store.get(
      dataLoadingStatusByRealIndexCallbackState,
    );

    const lengthOfOverscanWindow =
      lastRealIndexInOverscanWindow - firstRealIndexInOverscanWindow + 1;

    const newRecordIdByRealIndex = new Map<number, string>();
    const newDataLoadingStatusByRealIndex = new Map<
      number,
      'loaded' | 'not-loaded'
    >();

    for (let i = 0; i < lengthOfOverscanWindow; i++) {
      const realIndex = firstRealIndexInOverscanWindow + i;

      const existingRecordId = recordIdByRealIndex.get(realIndex);

      if (isDefined(existingRecordId)) {
        newRecordIdByRealIndex.set(realIndex, existingRecordId);
      }

      const existingDataLoadingStatus =
        dataLoadingStatusByRealIndex.get(realIndex);

      if (isDefined(existingDataLoadingStatus)) {
        newDataLoadingStatusByRealIndex.set(
          realIndex,
          existingDataLoadingStatus,
        );
      }
    }

    store.set(recordIdByRealIndexCallbackState, newRecordIdByRealIndex);
    store.set(
      dataLoadingStatusByRealIndexCallbackState,
      newDataLoadingStatusByRealIndex,
    );

    store.set(dataPagesLoadedCallbackState, []);
    store.set(totalNumberOfRecordsToVirtualizeCallbackState, totalCount);
  }, [
    findManyRecordsLazy,
    scrollWrapperHTMLElement?.clientHeight,
    lastScrollPositionCallbackState,
    totalNumberOfRecordsToVirtualizeCallbackState,
    dataPagesLoadedCallbackState,
    dataLoadingStatusByRealIndexCallbackState,
    recordIdByRealIndexCallbackState,
    store,
  ]);

  const resetVirtualizationBecauseDataChanged = useCallback(async () => {
    await resetVirtualization();

    await sleep(50);

    await triggerFetchPagesWithoutDebounce();
  }, [resetVirtualization, triggerFetchPagesWithoutDebounce]);

  return {
    resetVirtualizationBecauseDataChanged,
    resetVirtualization,
  };
};
