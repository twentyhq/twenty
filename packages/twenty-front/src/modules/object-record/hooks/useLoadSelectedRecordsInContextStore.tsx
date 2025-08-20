import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useRecoilCallback } from 'recoil';

type UseLoadSelectedRecordsInContextStoreProps = {
  objectNameSingular: string;
  objectRecordIds: string[];
  objectMetadataItemId: string;
};

export const useLoadSelectedRecordsInContextStore = ({
  objectNameSingular,
  objectRecordIds,
  objectMetadataItemId,
}: UseLoadSelectedRecordsInContextStoreProps) => {
  const { upsertRecords } = useUpsertRecordsInStore();

  const { findManyRecordsLazy } = useLazyFindManyRecords({
    objectNameSingular,
    filter: {
      id: {
        in: objectRecordIds,
      },
    },
  });

  const loadSelectedRecordsInContextStore = useRecoilCallback(
    ({ set }) => {
      return async () => {
        set(
          contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
            instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
          }),
          objectMetadataItemId,
        );

        set(
          contextStoreTargetedRecordsRuleComponentState.atomFamily({
            instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
          }),
          {
            mode: 'selection',
            selectedRecordIds: objectRecordIds,
          },
        );

        set(
          contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
            instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
          }),
          objectRecordIds.length,
        );

        const records = await findManyRecordsLazy();
        upsertRecords(records.records);
      };
    },
    [objectRecordIds, objectMetadataItemId, findManyRecordsLazy, upsertRecords],
  );

  return {
    loadSelectedRecordsInContextStore,
  };
};
