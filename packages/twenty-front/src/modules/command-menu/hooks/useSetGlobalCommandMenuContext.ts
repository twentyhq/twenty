import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { SIDE_PANEL_PREVIOUS_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelPreviousComponentInstanceId';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { hasUserSelectedSidePanelListItemState } from '@/side-panel/states/hasUserSelectedSidePanelListItemState';
import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { atom, useStore } from 'jotai';
import { useCallback } from 'react';

export const useSetGlobalCommandMenuContext = () => {
  const store = useStore();

  const setGlobalCommandMenuContext = useCallback(() => {
    store.set(
      atom(null, (get, batchSet) => {
        const fromId = SIDE_PANEL_COMPONENT_INSTANCE_ID;
        const toId = SIDE_PANEL_PREVIOUS_COMPONENT_INSTANCE_ID;

        batchSet(
          contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
            instanceId: toId,
          }),
          get(
            contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
              instanceId: fromId,
            }),
          ),
        );

        batchSet(
          contextStoreTargetedRecordsRuleComponentState.atomFamily({
            instanceId: toId,
          }),
          get(
            contextStoreTargetedRecordsRuleComponentState.atomFamily({
              instanceId: fromId,
            }),
          ),
        );

        batchSet(
          contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
            instanceId: toId,
          }),
          get(
            contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
              instanceId: fromId,
            }),
          ),
        );

        batchSet(
          contextStoreFiltersComponentState.atomFamily({
            instanceId: toId,
          }),
          get(
            contextStoreFiltersComponentState.atomFamily({
              instanceId: fromId,
            }),
          ),
        );

        batchSet(
          contextStoreFilterGroupsComponentState.atomFamily({
            instanceId: toId,
          }),
          get(
            contextStoreFilterGroupsComponentState.atomFamily({
              instanceId: fromId,
            }),
          ),
        );

        batchSet(
          contextStoreAnyFieldFilterValueComponentState.atomFamily({
            instanceId: toId,
          }),
          get(
            contextStoreAnyFieldFilterValueComponentState.atomFamily({
              instanceId: fromId,
            }),
          ),
        );

        batchSet(
          contextStoreCurrentViewIdComponentState.atomFamily({
            instanceId: toId,
          }),
          get(
            contextStoreCurrentViewIdComponentState.atomFamily({
              instanceId: fromId,
            }),
          ),
        );

        batchSet(
          contextStoreCurrentViewTypeComponentState.atomFamily({
            instanceId: toId,
          }),
          get(
            contextStoreCurrentViewTypeComponentState.atomFamily({
              instanceId: fromId,
            }),
          ),
        );

        batchSet(
          contextStoreTargetedRecordsRuleComponentState.atomFamily({
            instanceId: fromId,
          }),
          { mode: 'selection', selectedRecordIds: [] },
        );

        batchSet(
          contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
            instanceId: fromId,
          }),
          0,
        );

        batchSet(
          contextStoreFiltersComponentState.atomFamily({
            instanceId: fromId,
          }),
          [],
        );

        batchSet(
          contextStoreFilterGroupsComponentState.atomFamily({
            instanceId: fromId,
          }),
          [],
        );

        batchSet(
          contextStoreAnyFieldFilterValueComponentState.atomFamily({
            instanceId: fromId,
          }),
          '',
        );

        batchSet(
          contextStoreCurrentViewTypeComponentState.atomFamily({
            instanceId: fromId,
          }),
          ContextStoreViewType.Table,
        );

        batchSet(sidePanelPageInfoState.atom, {
          title: undefined,
          Icon: undefined,
          instanceId: '',
        });

        batchSet(hasUserSelectedSidePanelListItemState.atom, false);
      }),
    );
  }, [store]);

  return {
    setGlobalCommandMenuContext,
  };
};
