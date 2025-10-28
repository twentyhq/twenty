import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilCallback } from 'recoil';

export const useResetContextStoreStates = () => {
  const resetContextStoreStates = useRecoilCallback(({ set }) => {
    return (instanceId: string) => {
      set(
        contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
          instanceId,
        }),
        undefined,
      );

      set(
        contextStoreTargetedRecordsRuleComponentState.atomFamily({
          instanceId,
        }),
        {
          mode: 'selection',
          selectedRecordIds: [],
        },
      );

      set(
        contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
          instanceId,
        }),
        0,
      );

      set(
        contextStoreFiltersComponentState.atomFamily({
          instanceId,
        }),
        [],
      );

      set(
        contextStoreFilterGroupsComponentState.atomFamily({
          instanceId,
        }),
        [],
      );

      set(
        contextStoreAnyFieldFilterValueComponentState.atomFamily({
          instanceId,
        }),
        '',
      );

      set(
        contextStoreCurrentViewIdComponentState.atomFamily({
          instanceId,
        }),
        undefined,
      );
    };
  }, []);

  return { resetContextStoreStates };
};
