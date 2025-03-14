import { RecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/RecordActionMenuEntriesSetter';
import { RecordAgnosticActionMenuEntriesSetter } from '@/action-menu/actions/record-agnostic-actions/components/RecordAgnosticActionMenuEntriesSetter';
import { RunWorkflowRecordAgnosticActionMenuEntriesSetter } from '@/action-menu/actions/record-agnostic-actions/components/RunWorkflowRecordAgnosticActionMenuEntriesSetter';
import { ActionMenuConfirmationModals } from '@/action-menu/components/ActionMenuConfirmationModals';
import { RecordShowActionMenuButtons } from '@/action-menu/components/RecordShowActionMenuButtons';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';

export const RecordShowActionMenu = () => {
  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const hasSelectedRecord =
    contextStoreTargetedRecordsRule.mode === 'selection' &&
    contextStoreTargetedRecordsRule.selectedRecordIds.length === 1;

  const isWorkflowEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsWorkflowEnabled,
  );

  return (
    <>
      {hasSelectedRecord && contextStoreCurrentObjectMetadataItemId && (
        <ActionMenuContext.Provider
          value={{
            isInRightDrawer: false,
            onActionExecutedCallback: () => {},
          }}
        >
          <RecordShowActionMenuButtons />
          <ActionMenuConfirmationModals />
          <RecordActionMenuEntriesSetter />
          <RecordAgnosticActionMenuEntriesSetter />
          {isWorkflowEnabled && (
            <RunWorkflowRecordAgnosticActionMenuEntriesSetter />
          )}
        </ActionMenuContext.Provider>
      )}
    </>
  );
};
