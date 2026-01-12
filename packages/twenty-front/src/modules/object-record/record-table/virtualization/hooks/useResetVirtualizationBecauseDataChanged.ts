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
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';
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

  const { triggerFetchPagesWithoutDebounce } = useTriggerFetchPages();

  const lastScrollPositionCallbackState = useRecoilComponentCallbackState(
    lastScrollPositionComponentState,
  );

  const recordIdByRealIndexCallbackState = useRecoilComponentCallbackState(
    recordIdByRealIndexComponentState,
  );

  const dataLoadingStatusByRealIndexCallbackState =
    useRecoilComponentCallbackState(dataLoadingStatusByRealIndexComponentState);

  const resetVirtualization = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        const { totalCount } = await findManyRecordsLazy();

        const tableScrollWrapperHeight =
          scrollWrapperHTMLElement?.clientHeight ?? 0;

        const lastScrollPosition = getSnapshotValue(
          snapshot,
          lastScrollPositionCallbackState,
        );

        const totalNumberOfRecordsToVirtualize =
          getSnapshotValue(
            snapshot,
            totalNumberOfRecordsToVirtualizeCallbackState,
          ) ?? 0;

        const {
          firstRealIndexInOverscanWindow,
          lastRealIndexInOverscanWindow,
        } = getVirtualizationOverscanWindow(
          lastScrollPosition,
          tableScrollWrapperHeight,
          totalNumberOfRecordsToVirtualize,
        );

        const recordIdByRealIndex = getSnapshotValue(
          snapshot,
          recordIdByRealIndexCallbackState,
        );

        const dataLoadingStatusByRealIndex = getSnapshotValue(
          snapshot,
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

        set(recordIdByRealIndexCallbackState, newRecordIdByRealIndex);
        set(
          dataLoadingStatusByRealIndexCallbackState,
          newDataLoadingStatusByRealIndex,
        );

        set(dataPagesLoadedCallbackState, []);
        set(totalNumberOfRecordsToVirtualizeCallbackState, totalCount);
      },
    [
      findManyRecordsLazy,
      scrollWrapperHTMLElement?.clientHeight,
      lastScrollPositionCallbackState,
      totalNumberOfRecordsToVirtualizeCallbackState,
      dataPagesLoadedCallbackState,
      dataLoadingStatusByRealIndexCallbackState,
      recordIdByRealIndexCallbackState,
    ],
  );

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
