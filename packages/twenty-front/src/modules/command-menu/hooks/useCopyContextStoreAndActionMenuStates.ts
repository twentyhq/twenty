import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { contextStoreCurrentObjectMetadataItemComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilCallback } from 'recoil';

export const useCopyContextStoreStates = () => {
  const copyContextStoreStates = useRecoilCallback(
    ({ snapshot, set }) =>
      ({
        instanceIdToCopyFrom,
        instanceIdToCopyTo,
      }: {
        instanceIdToCopyFrom: string;
        instanceIdToCopyTo: string;
      }) => {
        const contextStoreCurrentObjectMetadataItem = snapshot
          .getLoadable(
            contextStoreCurrentObjectMetadataItemComponentState.atomFamily({
              instanceId: instanceIdToCopyFrom,
            }),
          )
          .getValue();

        set(
          contextStoreCurrentObjectMetadataItemComponentState.atomFamily({
            instanceId: instanceIdToCopyTo,
          }),
          contextStoreCurrentObjectMetadataItem,
        );

        const contextStoreTargetedRecordsRule = snapshot
          .getLoadable(
            contextStoreTargetedRecordsRuleComponentState.atomFamily({
              instanceId: instanceIdToCopyFrom,
            }),
          )
          .getValue();

        set(
          contextStoreTargetedRecordsRuleComponentState.atomFamily({
            instanceId: instanceIdToCopyTo,
          }),
          contextStoreTargetedRecordsRule,
        );

        const contextStoreNumberOfSelectedRecords = snapshot
          .getLoadable(
            contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
              instanceId: instanceIdToCopyFrom,
            }),
          )
          .getValue();

        set(
          contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
            instanceId: instanceIdToCopyTo,
          }),
          contextStoreNumberOfSelectedRecords,
        );

        const contextStoreFilters = snapshot
          .getLoadable(
            contextStoreFiltersComponentState.atomFamily({
              instanceId: instanceIdToCopyFrom,
            }),
          )
          .getValue();

        set(
          contextStoreFiltersComponentState.atomFamily({
            instanceId: instanceIdToCopyTo,
          }),
          contextStoreFilters,
        );

        const contextStoreCurrentViewId = snapshot
          .getLoadable(
            contextStoreCurrentViewIdComponentState.atomFamily({
              instanceId: instanceIdToCopyFrom,
            }),
          )
          .getValue();

        set(
          contextStoreCurrentViewIdComponentState.atomFamily({
            instanceId: instanceIdToCopyTo,
          }),
          contextStoreCurrentViewId,
        );

        const contextStoreCurrentViewType = snapshot
          .getLoadable(
            contextStoreCurrentViewTypeComponentState.atomFamily({
              instanceId: instanceIdToCopyFrom,
            }),
          )
          .getValue();

        set(
          contextStoreCurrentViewTypeComponentState.atomFamily({
            instanceId: instanceIdToCopyTo,
          }),
          contextStoreCurrentViewType,
        );

        const actionMenuEntries = snapshot
          .getLoadable(
            actionMenuEntriesComponentState.atomFamily({
              instanceId: instanceIdToCopyFrom,
            }),
          )
          .getValue();

        set(
          actionMenuEntriesComponentState.atomFamily({
            instanceId: instanceIdToCopyTo,
          }),
          actionMenuEntries,
        );
      },
    [],
  );

  return { copyContextStoreStates };
};
