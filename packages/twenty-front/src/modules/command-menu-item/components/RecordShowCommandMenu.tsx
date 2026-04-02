import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/server-items/display/components/PinnedCommandMenuItemButtons';
import { CommandMenuItemEditButton } from '@/command-menu-item/server-items/edit/components/CommandMenuItemEditButton';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIsMobile } from 'twenty-ui/utilities';

export const RecordShowCommandMenu = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const hasSelectedRecord =
    contextStoreTargetedRecordsRule.mode === 'selection' &&
    contextStoreTargetedRecordsRule.selectedRecordIds.length === 1;

  const isMobile = useIsMobile();

  return (
    <>
      {hasSelectedRecord && contextStoreCurrentObjectMetadataItemId && (
        <>
          <CommandMenuContextProvider
            isInSidePanel={false}
            displayType="button"
            containerType="show-page-header"
          >
            {!isMobile && <PinnedCommandMenuItemButtons />}
          </CommandMenuContextProvider>
          <CommandMenuItemEditButton />
        </>
      )}
    </>
  );
};
