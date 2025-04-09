import { RecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/RecordActionMenuEntriesSetter';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { RecordAgnosticActionMenuEntriesSetter } from '@/action-menu/actions/record-agnostic-actions/components/RecordAgnosticActionMenuEntriesSetter';
import { RunWorkflowRecordAgnosticActionMenuEntriesSetter } from '@/action-menu/actions/record-agnostic-actions/components/RunWorkflowRecordAgnosticActionMenuEntriesSetter';
import { RecordAgnosticActionsKeys } from '@/action-menu/actions/record-agnostic-actions/types/RecordAgnosticActionsKeys';
import { ActionMenuConfirmationModals } from '@/action-menu/components/ActionMenuConfirmationModals';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { CommandMenuOpenContainer } from '@/command-menu/components/CommandMenuOpenContainer';
import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useCommandMenuCloseAnimationCompleteCleanup } from '@/command-menu/hooks/useCommandMenuCloseAnimationCompleteCleanup';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { AnimatePresence } from 'framer-motion';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const CommandMenuContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { toggleCommandMenu } = useCommandMenu();

  const { commandMenuCloseAnimationCompleteCleanup } =
    useCommandMenuCloseAnimationCompleteCleanup();

  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);

  const isWorkflowEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsWorkflowEnabled,
  );

  const setCommandMenuSearch = useSetRecoilState(commandMenuSearchState);

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
              <ActionMenuContext.Provider
                value={{
                  isInRightDrawer: true,
                  onActionExecutedCallback: ({ key }) => {
                    if (
                      key !== RecordAgnosticActionsKeys.SEARCH_RECORDS &&
                      key !==
                        RecordAgnosticActionsKeys.SEARCH_RECORDS_FALLBACK &&
                      key !== NoSelectionRecordActionKeys.CREATE_NEW_RECORD
                    ) {
                      toggleCommandMenu();
                    }

                    if (
                      key !== RecordAgnosticActionsKeys.SEARCH_RECORDS_FALLBACK
                    ) {
                      setCommandMenuSearch('');
                    }
                  },
                }}
              >
                <RecordActionMenuEntriesSetter />
                <RecordAgnosticActionMenuEntriesSetter />
                {isWorkflowEnabled && (
                  <RunWorkflowRecordAgnosticActionMenuEntriesSetter />
                )}
                <ActionMenuConfirmationModals />
                <AnimatePresence
                  mode="wait"
                  onExitComplete={commandMenuCloseAnimationCompleteCleanup}
                >
                  {isCommandMenuOpened && (
                    <CommandMenuOpenContainer>
                      {children}
                    </CommandMenuOpenContainer>
                  )}
                </AnimatePresence>
              </ActionMenuContext.Provider>
            </ActionMenuComponentInstanceContext.Provider>
          </ContextStoreComponentInstanceContext.Provider>
        </RecordSortsComponentInstanceContext.Provider>
      </RecordFiltersComponentInstanceContext.Provider>
    </RecordFilterGroupsComponentInstanceContext.Provider>
  );
};
