import { RecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/RecordActionMenuEntriesSetter';
import { ActionMenuBar } from '@/action-menu/components/ActionMenuBar';
import { ActionMenuConfirmationModals } from '@/action-menu/components/ActionMenuConfirmationModals';
import { ActionMenuDropdown } from '@/action-menu/components/ActionMenuDropdown';
import { ActionMenuEffect } from '@/action-menu/components/ActionMenuEffect';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { useRecoilValue } from 'recoil';

export const ActionMenu = ({ actionMenuId }: { actionMenuId: string }) => {
  const contextStoreCurrentObjectMetadataId = useRecoilValue(
    contextStoreCurrentObjectMetadataIdState,
  );

  return (
    <>
      {contextStoreCurrentObjectMetadataId && (
        <ActionMenuComponentInstanceContext.Provider
          value={{ instanceId: actionMenuId }}
        >
          <ActionMenuBar />
          <ActionMenuDropdown />
          <ActionMenuConfirmationModals />
          <ActionMenuEffect />
          <RecordActionMenuEntriesSetter />
        </ActionMenuComponentInstanceContext.Provider>
      )}
    </>
  );
};
