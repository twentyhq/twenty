import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useRecordsFieldVisibleGqlFields } from '@/object-record/record-field/hooks/useRecordsFieldVisibleGqlFields';

import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { useTriggerFetchPages } from '@/object-record/record-table/virtualization/hooks/useTriggerFetchPages';
import { dataLoadingStatusByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/dataLoadingStatusByRealIndexComponentFamilyState';
import { dataPagesLoadedComponentState } from '@/object-record/record-table/virtualization/states/dataPagesLoadedComponentState';
import { lastScrollPositionComponentState } from '@/object-record/record-table/virtualization/states/lastScrollPositionComponentState';
import { recordIdByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilyState';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { getVirtualizationOverscanWindow } from '@/object-record/record-table/virtualization/utils/getVirtualizationOverscanWindow';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';
import { sleep } from '~/utils/sleep';

export const useResetVirtualizationBecauseDataChanged = (
  objectNameSingular: string,
) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const params = useFindManyRecordIndexTableParams(objectNameSingular);
  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

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

  const lastScrollPositionCallbackState = useRecoilComponentCallbackState(
    lastScrollPositionComponentState,
  );

  const recordIdByRealIndexCallbackState =
    useRecoilComponentFamilyCallbackState(
      recordIdByRealIndexComponentFamilyState,
    );

  const dataLoadingStatusByRealIndexCallbackState =
    useRecoilComponentCallbackState(
      dataLoadingStatusByRealIndexComponentFamilyState,
    );

  const { triggerFetchPagesWithoutDebounce } = useTriggerFetchPages();

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

        for (let i = 0; i < totalNumberOfRecordsToVirtualize; i++) {
          const indexIsInOverscanWindow =
            i >= firstRealIndexInOverscanWindow &&
            i <= lastRealIndexInOverscanWindow;

          if (!indexIsInOverscanWindow) {
            set(
              dataLoadingStatusByRealIndexCallbackState({
                realIndex: i,
              }),
              null,
            );

            set(
              recordIdByRealIndexCallbackState({
                realIndex: i,
              }),
              null,
            );
          }
        }
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
