import { RecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/RecordActionMenuEntriesSetter';
import { RecordAgnosticActionMenuEntriesSetter } from '@/action-menu/actions/record-agnostic-actions/components/RecordAgnosticActionMenuEntriesSetter';
import { RunWorkflowRecordAgnosticActionMenuEntriesSetter } from '@/action-menu/actions/record-agnostic-actions/components/RunWorkflowRecordAgnosticActionMenuEntriesSetter';
import { ActionMenuConfirmationModals } from '@/action-menu/components/ActionMenuConfirmationModals';
import { RightDrawerActionMenuDropdown } from '@/action-menu/components/RightDrawerActionMenuDropdown';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';

import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const RecordShowRightDrawerActionMenu = () => {
  const contextStoreCurrentObjectMetadataId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );

  const isWorkflowEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsWorkflowEnabled,
  );

  return (
    <>
      {contextStoreCurrentObjectMetadataId && (
        <ActionMenuContext.Provider value={{ isInRightDrawer: true }}>
          <RightDrawerActionMenuDropdown />
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
