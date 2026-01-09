import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useRecordsFieldVisibleGqlFields } from '@/object-record/record-field/hooks/useRecordsFieldVisibleGqlFields';

import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { useTriggerFetchPages } from '@/object-record/record-table/virtualization/hooks/useTriggerFetchPages';
import { dataPagesLoadedComponentState } from '@/object-record/record-table/virtualization/states/dataPagesLoadedComponentState';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
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

  const resetVirtualization = useRecoilCallback(
    ({ set }) =>
      async () => {
        const { totalCount } = await findManyRecordsLazy();

        set(dataPagesLoadedCallbackState, []);
        set(totalNumberOfRecordsToVirtualizeCallbackState, totalCount);
      },
    [
      dataPagesLoadedCallbackState,
      totalNumberOfRecordsToVirtualizeCallbackState,
      findManyRecordsLazy,
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
