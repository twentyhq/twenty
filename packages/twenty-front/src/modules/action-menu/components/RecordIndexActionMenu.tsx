import { RecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/RecordActionMenuEntriesSetter';
import { ActionMenuConfirmationModals } from '@/action-menu/components/ActionMenuConfirmationModals';
import { RecordIndexActionMenuBar } from '@/action-menu/components/RecordIndexActionMenuBar';
import { RecordIndexActionMenuDropdown } from '@/action-menu/components/RecordIndexActionMenuDropdown';
import { RecordIndexActionMenuEffect } from '@/action-menu/components/RecordIndexActionMenuEffect';

import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { useRecoilValue } from 'recoil';

export const RecordIndexActionMenu = ({
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
