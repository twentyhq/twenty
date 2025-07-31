import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { isCommandMenuPersistentState } from '@/command-menu/states/isCommandMenuPersistentState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export const CommandMenuPersistentContextStoreEffect = () => {
  const isCommandMenuPersistent = useRecoilValue(isCommandMenuPersistentState);

  const mainContextStoreCurrentObjectMetadataItemId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const mainContextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const mainContextStoreNumberOfSelectedRecords = useRecoilComponentValueV2(
    contextStoreNumberOfSelectedRecordsComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const mainContextStoreFilters = useRecoilComponentValueV2(
    contextStoreFiltersComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const mainContextStoreAnyFieldFilterValue = useRecoilComponentValueV2(
    contextStoreAnyFieldFilterValueComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const mainContextStoreCurrentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const mainContextStoreCurrentViewType = useRecoilComponentValueV2(
    contextStoreCurrentViewTypeComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const setCommandMenuCurrentObjectMetadataItemId =
    useSetRecoilComponentStateV2(
      contextStoreCurrentObjectMetadataItemIdComponentState,
      COMMAND_MENU_COMPONENT_INSTANCE_ID,
    );

  const setCommandMenuTargetedRecordsRule = useSetRecoilComponentStateV2(
    contextStoreTargetedRecordsRuleComponentState,
    COMMAND_MENU_COMPONENT_INSTANCE_ID,
  );

  const setCommandMenuNumberOfSelectedRecords = useSetRecoilComponentStateV2(
    contextStoreNumberOfSelectedRecordsComponentState,
    COMMAND_MENU_COMPONENT_INSTANCE_ID,
  );

  const setCommandMenuFilters = useSetRecoilComponentStateV2(
    contextStoreFiltersComponentState,
    COMMAND_MENU_COMPONENT_INSTANCE_ID,
  );

  const setCommandMenuAnyFieldFilterValue = useSetRecoilComponentStateV2(
    contextStoreAnyFieldFilterValueComponentState,
    COMMAND_MENU_COMPONENT_INSTANCE_ID,
  );

  const setCommandMenuCurrentViewId = useSetRecoilComponentStateV2(
    contextStoreCurrentViewIdComponentState,
    COMMAND_MENU_COMPONENT_INSTANCE_ID,
  );

  const setCommandMenuCurrentViewType = useSetRecoilComponentStateV2(
    contextStoreCurrentViewTypeComponentState,
    COMMAND_MENU_COMPONENT_INSTANCE_ID,
  );

  useEffect(() => {
    if (isCommandMenuPersistent) {
      setCommandMenuCurrentObjectMetadataItemId(
        mainContextStoreCurrentObjectMetadataItemId,
      );
    }
  }, [
    isCommandMenuPersistent,
    mainContextStoreCurrentObjectMetadataItemId,
    setCommandMenuCurrentObjectMetadataItemId,
  ]);

  useEffect(() => {
    if (isCommandMenuPersistent) {
      setCommandMenuTargetedRecordsRule(mainContextStoreTargetedRecordsRule);
    }
  }, [
    isCommandMenuPersistent,
    mainContextStoreTargetedRecordsRule,
    setCommandMenuTargetedRecordsRule,
  ]);

  useEffect(() => {
    if (isCommandMenuPersistent) {
      setCommandMenuNumberOfSelectedRecords(
        mainContextStoreNumberOfSelectedRecords,
      );
    }
  }, [
    isCommandMenuPersistent,
    mainContextStoreNumberOfSelectedRecords,
    setCommandMenuNumberOfSelectedRecords,
  ]);

  useEffect(() => {
    if (isCommandMenuPersistent) {
      setCommandMenuFilters(mainContextStoreFilters);
    }
  }, [isCommandMenuPersistent, mainContextStoreFilters, setCommandMenuFilters]);

  useEffect(() => {
    if (isCommandMenuPersistent) {
      setCommandMenuAnyFieldFilterValue(mainContextStoreAnyFieldFilterValue);
    }
  }, [
    isCommandMenuPersistent,
    mainContextStoreAnyFieldFilterValue,
    setCommandMenuAnyFieldFilterValue,
  ]);

  useEffect(() => {
    if (isCommandMenuPersistent) {
      setCommandMenuCurrentViewId(mainContextStoreCurrentViewId);
    }
  }, [
    isCommandMenuPersistent,
    mainContextStoreCurrentViewId,
    setCommandMenuCurrentViewId,
  ]);

  useEffect(() => {
    if (isCommandMenuPersistent) {
      setCommandMenuCurrentViewType(mainContextStoreCurrentViewType);
    }
  }, [
    isCommandMenuPersistent,
    mainContextStoreCurrentViewType,
    setCommandMenuCurrentViewType,
  ]);

  return null;
};
