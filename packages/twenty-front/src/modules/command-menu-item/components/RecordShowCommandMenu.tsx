import { PageHeaderCommandMenuButtons } from '@/command-menu-item/components/PageHeaderCommandMenuButtons';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/server-items/display/components/PinnedCommandMenuItemButtons';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { CommandMenuItemEditButton } from '@/command-menu-item/server-items/edit/components/CommandMenuItemEditButton';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
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
  const isCommandMenuItemEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED,
  );

  return (
    <>
      {hasSelectedRecord && contextStoreCurrentObjectMetadataItemId && (
        <>
          <CommandMenuContextProvider
            isInSidePanel={false}
            displayType="button"
            containerType="show-page-header"
          >
            {!isMobile &&
              (isCommandMenuItemEnabled ? (
                <PinnedCommandMenuItemButtons />
              ) : (
                <PageHeaderCommandMenuButtons />
              ))}
          </CommandMenuContextProvider>
          <CommandMenuItemEditButton />
        </>
      )}
    </>
  );
};
