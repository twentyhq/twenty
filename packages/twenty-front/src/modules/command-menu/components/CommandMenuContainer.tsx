import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { CommandMenuOpenContainer } from '@/command-menu/components/CommandMenuOpenContainer';
import { CommandMenuPersistentContextStoreEffect } from '@/command-menu/components/CommandMenuPersistentContextStoreEffect';
import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { useCommandMenuCloseAnimationCompleteCleanup } from '@/command-menu/hooks/useCommandMenuCloseAnimationCompleteCleanup';
import { useCommandMenuHotKeys } from '@/command-menu/hooks/useCommandMenuHotKeys';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { isCommandMenuPersistentState } from '@/command-menu/states/isCommandMenuPersistentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { AnimatePresence } from 'framer-motion';
import { useRecoilValue } from 'recoil';

export const CommandMenuContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { commandMenuCloseAnimationCompleteCleanup } =
    useCommandMenuCloseAnimationCompleteCleanup();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);

  const objectMetadataItemId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    COMMAND_MENU_COMPONENT_INSTANCE_ID,
  );

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === objectMetadataItemId,
  );

  const currentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
    COMMAND_MENU_COMPONENT_INSTANCE_ID,
  );

  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem?.namePlural ?? '',
    currentViewId ?? '',
  );

  const isCommandMenuPersistent = useRecoilValue(isCommandMenuPersistentState);

  useCommandMenuHotKeys();

  const handleCommandMenuClick = () => {
    if (!isCommandMenuPersistent) {
      return;
    }
    pushFocusItemToFocusStack({
      focusId: SIDE_PANEL_FOCUS_ID,
      component: {
        type: FocusComponentType.SIDE_PANEL,
        instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  };

  const commandMenuContent = (
    <div onClick={handleCommandMenuClick}>
      <CommandMenuOpenContainer>{children}</CommandMenuOpenContainer>
    </div>
  );

  return (
    <RecordFilterGroupsComponentInstanceContext.Provider
      value={{ instanceId: recordIndexId }}
    >
      <RecordFiltersComponentInstanceContext.Provider
        value={{ instanceId: recordIndexId }}
      >
        <RecordSortsComponentInstanceContext.Provider
          value={{ instanceId: recordIndexId }}
        >
          <ContextStoreComponentInstanceContext.Provider
            value={{ instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID }}
          >
            <ActionMenuComponentInstanceContext.Provider
              value={{ instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID }}
            >
              <CommandMenuPersistentContextStoreEffect />
              <AnimatePresence
                onExitComplete={commandMenuCloseAnimationCompleteCleanup}
              >
                {isCommandMenuOpened && commandMenuContent}
              </AnimatePresence>
            </ActionMenuComponentInstanceContext.Provider>
          </ContextStoreComponentInstanceContext.Provider>
        </RecordSortsComponentInstanceContext.Provider>
      </RecordFiltersComponentInstanceContext.Provider>
    </RecordFilterGroupsComponentInstanceContext.Provider>
  );
};
