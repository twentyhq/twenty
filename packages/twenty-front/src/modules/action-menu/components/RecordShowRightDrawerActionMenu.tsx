import { RecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/RecordActionMenuEntriesSetter';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { RecordAgnosticActionMenuEntriesSetter } from '@/action-menu/actions/record-agnostic-actions/components/RecordAgnosticActionMenuEntriesSetter';
import { RunWorkflowRecordAgnosticActionMenuEntriesSetter } from '@/action-menu/actions/record-agnostic-actions/components/RunWorkflowRecordAgnosticActionMenuEntriesSetter';
import { ActionMenuConfirmationModals } from '@/action-menu/components/ActionMenuConfirmationModals';
import { CommandMenuActionMenuDropdown } from '@/action-menu/components/CommandMenuActionMenuDropdown';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isDefined } from 'twenty-shared';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const RecordShowRightDrawerActionMenu = () => {
  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const isWorkflowEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsWorkflowEnabled,
  );

  const { toggleCommandMenu } = useCommandMenu();

  return (
    <>
      {contextStoreCurrentObjectMetadataItemId && (
        <ActionMenuContext.Provider
          value={{
            isInRightDrawer: true,
            onActionExecutedCallback: ({ key }) => {
              if (
                key === SingleRecordActionKeys.DELETE ||
                key === SingleRecordActionKeys.DESTROY
              ) {
                toggleCommandMenu();
              }
            },
          }}
        >
          <CommandMenuActionMenuDropdown />
          <ActionMenuConfirmationModals />

          {isDefined(contextStoreTargetedRecordsRule) &&
            contextStoreTargetedRecordsRule.mode === 'selection' &&
            contextStoreTargetedRecordsRule.selectedRecordIds.length > 0 && (
              <RecordActionMenuEntriesSetter />
            )}
          <RecordAgnosticActionMenuEntriesSetter />
          {isWorkflowEnabled && (
            <RunWorkflowRecordAgnosticActionMenuEntriesSetter />
          )}
        </ActionMenuContext.Provider>
      )}
    </>
  );
};
