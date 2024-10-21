import { RecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/RecordActionMenuEntriesSetter';
import { ActionMenuConfirmationModals } from '@/action-menu/components/ActionMenuConfirmationModals';
import { RecordShowActionMenuBar } from '@/action-menu/components/RecordShowActionMenuBar';

import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { useRecoilValue } from 'recoil';

export const RecordShowActionMenu = ({
  actionMenuId,
}: {
  actionMenuId: string;
}) => {
  const contextStoreCurrentObjectMetadataId = useRecoilValue(
    contextStoreCurrentObjectMetadataIdState,
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
