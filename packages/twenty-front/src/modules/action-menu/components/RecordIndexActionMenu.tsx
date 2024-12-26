import { RecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/RecordActionMenuEntriesSetter';
import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { RecordAgnosticActionsSetterEffect } from '@/action-menu/actions/record-agnostic-actions/components/RecordAgnosticActionsSetterEffect';
import { ActionMenuConfirmationModals } from '@/action-menu/components/ActionMenuConfirmationModals';
import { RecordIndexActionMenuBar } from '@/action-menu/components/RecordIndexActionMenuBar';
import { RecordIndexActionMenuButtons } from '@/action-menu/components/RecordIndexActionMenuButtons';
import { RecordIndexActionMenuDropdown } from '@/action-menu/components/RecordIndexActionMenuDropdown';
import { RecordIndexActionMenuEffect } from '@/action-menu/components/RecordIndexActionMenuEffect';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';

import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { isRecordIndexLoadMoreLockedComponentState } from '@/object-record/record-index/states/isRecordIndexLoadMoreLockedComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useIsMobile } from 'twenty-ui';

export const RecordIndexActionMenu = ({ indexId }: { indexId: string }) => {
  const contextStoreCurrentObjectMetadataId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );

  const isWorkflowEnabled = useIsFeatureEnabled('IS_WORKFLOW_ENABLED');

  const isPageHeaderV2Enabled = useIsFeatureEnabled(
    'IS_PAGE_HEADER_V2_ENABLED',
  );

  const isMobile = useIsMobile();

  const setIsLoadMoreLocked = useSetRecoilComponentStateV2(
    isRecordIndexLoadMoreLockedComponentState,
    indexId,
  );

  return (
    <>
      {contextStoreCurrentObjectMetadataId && (
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
          {isPageHeaderV2Enabled ? (
            <>{!isMobile && <RecordIndexActionMenuButtons />}</>
          ) : (
            <RecordIndexActionMenuBar />
          )}
          <RecordIndexActionMenuDropdown />
          <ActionMenuConfirmationModals />
          <RecordIndexActionMenuEffect />
          <RecordActionMenuEntriesSetter />
          {isWorkflowEnabled && <RecordAgnosticActionsSetterEffect />}
        </ActionMenuContext.Provider>
      )}
    </>
  );
};
