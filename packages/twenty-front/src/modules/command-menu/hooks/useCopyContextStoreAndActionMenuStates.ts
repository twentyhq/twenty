import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
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
        instanceIdToCopy,
        instanceIdToCopyTo,
      }: {
        instanceIdToCopy: string;
        instanceIdToCopyTo: string;
      }) => {
        const contextStoreCurrentObjectMetadataId = snapshot
          .getLoadable(
            contextStoreCurrentObjectMetadataIdComponentState.atomFamily({
              instanceId: instanceIdToCopy,
            }),
          )
          .getValue();

        set(
          contextStoreCurrentObjectMetadataIdComponentState.atomFamily({
            instanceId: instanceIdToCopyTo,
          }),
          contextStoreCurrentObjectMetadataId,
        );

        const contextStoreTargetedRecordsRule = snapshot
          .getLoadable(
            contextStoreTargetedRecordsRuleComponentState.atomFamily({
              instanceId: instanceIdToCopy,
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
              instanceId: instanceIdToCopy,
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
              instanceId: instanceIdToCopy,
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
              instanceId: instanceIdToCopy,
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
              instanceId: instanceIdToCopy,
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
              instanceId: instanceIdToCopy,
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
