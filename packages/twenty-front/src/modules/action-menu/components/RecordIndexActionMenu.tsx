import { RecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/RecordActionMenuEntriesSetter';
import { ActionMenuConfirmationModals } from '@/action-menu/components/ActionMenuConfirmationModals';
import { RecordIndexActionMenuBar } from '@/action-menu/components/RecordIndexActionMenuBar';
import { RecordIndexActionMenuDropdown } from '@/action-menu/components/RecordIndexActionMenuDropdown';
import { RecordIndexActionMenuEffect } from '@/action-menu/components/RecordIndexActionMenuEffect';

import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordIndexActionMenu = () => {
  const contextStoreCurrentObjectMetadataId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );

  const contextStoreComponentInstanceId =
    useAvailableComponentInstanceIdOrThrow(
      ContextStoreComponentInstanceContext,
    );

  return (
    <>
      {contextStoreCurrentObjectMetadataId && (
        <ActionMenuComponentInstanceContext.Provider
          value={{ instanceId: contextStoreComponentInstanceId }}
        >
          <RecordIndexActionMenuBar />
          <RecordIndexActionMenuDropdown />
          <ActionMenuConfirmationModals />
          <RecordIndexActionMenuEffect />
          <RecordActionMenuEntriesSetter actionMenuType="recordIndex" />
        </ActionMenuComponentInstanceContext.Provider>
      )}
    </>
  );
};
