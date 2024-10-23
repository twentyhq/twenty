import { RecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/RecordActionMenuEntriesSetter';
import { ActionMenuConfirmationModals } from '@/action-menu/components/ActionMenuConfirmationModals';
import { RecordShowActionMenuBar } from '@/action-menu/components/RecordShowActionMenuBar';

import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordShowActionMenu = ({
  actionMenuId,
}: {
  actionMenuId: string;
}) => {
  const contextStoreCurrentObjectMetadataId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );

  return (
    <>
      {contextStoreCurrentObjectMetadataId && (
        <ActionMenuComponentInstanceContext.Provider
          value={{ instanceId: actionMenuId }}
        >
          <RecordShowActionMenuBar />
          <ActionMenuConfirmationModals />
          <RecordActionMenuEntriesSetter actionMenuType="recordShow" />
        </ActionMenuComponentInstanceContext.Provider>
      )}
    </>
  );
};
