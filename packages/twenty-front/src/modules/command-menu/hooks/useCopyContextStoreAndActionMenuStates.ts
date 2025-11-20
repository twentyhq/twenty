import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
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
        const contextStoreCurrentObjectMetadataItemId = snapshot
          .getLoadable(
            contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
              instanceId: instanceIdToCopyFrom,
            }),
          )
          .getValue();

        set(
          contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
            instanceId: instanceIdToCopyTo,
          }),
          contextStoreCurrentObjectMetadataItemId,
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

        const contextStoreFilterGroups = snapshot
          .getLoadable(
            contextStoreFilterGroupsComponentState.atomFamily({
              instanceId: instanceIdToCopyFrom,
            }),
          )
          .getValue();

        set(
          contextStoreFilterGroupsComponentState.atomFamily({
            instanceId: instanceIdToCopyTo,
          }),
          contextStoreFilterGroups,
        );

        const contextStoreAnyFieldFilterValue = snapshot
          .getLoadable(
            contextStoreAnyFieldFilterValueComponentState.atomFamily({
              instanceId: instanceIdToCopyFrom,
            }),
          )
          .getValue();

        set(
          contextStoreAnyFieldFilterValueComponentState.atomFamily({
            instanceId: instanceIdToCopyTo,
          }),
          contextStoreAnyFieldFilterValue,
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

        const contextStoreIsFullTabWidgetInEditMode = snapshot
          .getLoadable(
            contextStoreIsPageInEditModeComponentState.atomFamily({
              instanceId: instanceIdToCopyFrom,
            }),
          )
          .getValue();

        set(
          contextStoreIsPageInEditModeComponentState.atomFamily({
            instanceId: instanceIdToCopyTo,
          }),
          contextStoreIsFullTabWidgetInEditMode,
        );
      },
    [],
  );

  return { copyContextStoreStates };
};
