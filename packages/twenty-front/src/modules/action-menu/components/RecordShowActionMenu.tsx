import { PageHeaderActionMenuButtons } from '@/action-menu/components/PageHeaderActionMenuButtons';
import { ActionMenuContextProvider } from '@/action-menu/contexts/ActionMenuContextProvider';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useIsMobile } from 'twenty-ui/utilities';

export const RecordShowActionMenu = () => {
  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const contextStoreTargetedRecordsRule = useRecoilComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
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
