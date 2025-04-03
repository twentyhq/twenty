import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { PageHeaderActionMenuButtons } from '@/action-menu/components/PageHeaderActionMenuButtons';
import { RecordIndexActionMenuDropdown } from '@/action-menu/components/RecordIndexActionMenuDropdown';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { isRecordIndexLoadMoreLockedComponentState } from '@/object-record/record-index/states/isRecordIndexLoadMoreLockedComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useIsMobile } from 'twenty-ui';

export const RecordIndexActionMenu = ({ indexId }: { indexId: string }) => {
  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const isMobile = useIsMobile();

  const setIsLoadMoreLocked = useSetRecoilComponentStateV2(
    isRecordIndexLoadMoreLockedComponentState,
    indexId,
  );

  return (
    <>
      {contextStoreCurrentObjectMetadataItemId && (
        <ActionMenuContext.Provider
          value={{
            isInRightDrawer: false,
            onActionStartedCallback: (action) => {
              if (action.key === MultipleRecordsActionKeys.DELETE) {
                setIsLoadMoreLocked(true);
              }
            },
            onActionExecutedCallback: (action) => {
              if (action.key === MultipleRecordsActionKeys.DELETE) {
                setIsLoadMoreLocked(false);
              }
            },
          }}
        >
          {!isMobile && <PageHeaderActionMenuButtons />}
          <RecordIndexActionMenuDropdown />
        </ActionMenuContext.Provider>
      )}
    </>
  );
};
