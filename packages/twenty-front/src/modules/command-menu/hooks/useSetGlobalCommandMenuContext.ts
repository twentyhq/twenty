import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { COMMAND_MENU_PREVIOUS_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuPreviousComponentInstanceId';
import { useCopyContextStoreStates } from '@/command-menu/hooks/useCopyContextStoreAndActionMenuStates';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { hasUserSelectedCommandState } from '@/command-menu/states/hasUserSelectedCommandState';
import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useCallback } from 'react';
import { useStore } from 'jotai';

export const useSetGlobalCommandMenuContext = () => {
  const store = useStore();
  const { copyContextStoreStates } = useCopyContextStoreStates();

  const setGlobalCommandMenuContext = useCallback(() => {
    copyContextStoreStates({
      instanceIdToCopyFrom: COMMAND_MENU_COMPONENT_INSTANCE_ID,
      instanceIdToCopyTo: COMMAND_MENU_PREVIOUS_COMPONENT_INSTANCE_ID,
    });

    store.set(
      contextStoreTargetedRecordsRuleComponentState.atomFamily({
        instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID,
      }),
      {
        mode: 'selection',
        selectedRecordIds: [],
      },
    );

    store.set(
      contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
        instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID,
      }),
      0,
    );

    store.set(
      contextStoreFiltersComponentState.atomFamily({
        instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID,
      }),
      [],
    );

    store.set(
      contextStoreFilterGroupsComponentState.atomFamily({
        instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID,
      }),
      [],
    );

    store.set(
      contextStoreAnyFieldFilterValueComponentState.atomFamily({
        instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID,
      }),
      '',
    );

    store.set(
      contextStoreCurrentViewTypeComponentState.atomFamily({
        instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID,
      }),
      ContextStoreViewType.Table,
    );

    store.set(commandMenuPageInfoState.atom, {
      title: undefined,
      Icon: undefined,
      instanceId: '',
    });

    store.set(hasUserSelectedCommandState.atom, false);
  }, [copyContextStoreStates, store]);

  return {
    setGlobalCommandMenuContext,
  };
};
