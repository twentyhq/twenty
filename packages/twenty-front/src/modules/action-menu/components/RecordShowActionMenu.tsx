import { PageHeaderActionMenuButtons } from '@/action-menu/components/PageHeaderActionMenuButtons';
import { ActionMenuContextProvider } from '@/action-menu/contexts/ActionMenuContextProvider';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { useIsMobile } from 'twenty-ui/utilities';

export const RecordShowActionMenu = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentValue(
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
        <ActionMenuContextProvider
          isInRightDrawer={false}
          displayType="button"
          actionMenuType="show-page-action-menu"
        >
          {!isMobile && <PageHeaderActionMenuButtons />}
        </ActionMenuContextProvider>
      )}
    </>
  );
};
