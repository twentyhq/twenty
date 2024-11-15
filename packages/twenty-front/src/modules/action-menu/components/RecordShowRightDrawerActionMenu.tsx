import { GlobalActionMenuEntriesSetter } from '@/action-menu/actions/global-actions/components/GlobalActionMenuEntriesSetter';
import { RecordActionMenuEntriesSetter } from '@/action-menu/actions/record-actions/components/RecordActionMenuEntriesSetter';
import { ActionMenuConfirmationModals } from '@/action-menu/components/ActionMenuConfirmationModals';
import { RightDrawerActionMenuDropdown } from '@/action-menu/components/RightDrawerActionMenuDropdown';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';

import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordShowRightDrawerActionMenu = () => {
  const contextStoreCurrentObjectMetadataId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );

  return (
    <>
      {contextStoreCurrentObjectMetadataId && (
        <ActionMenuContext.Provider
          value={{
            isInRightDrawer: true,
            onActionExecutedCallback: () => {},
          }}
        >
          <RightDrawerActionMenuDropdown />
          <ActionMenuConfirmationModals />
          <RecordActionMenuEntriesSetter />
          <GlobalActionMenuEntriesSetter />
        </ActionMenuContext.Provider>
      )}
    </>
  );
};
