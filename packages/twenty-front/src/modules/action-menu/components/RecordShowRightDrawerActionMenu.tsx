import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { CommandMenuActionMenuDropdown } from '@/action-menu/components/CommandMenuActionMenuDropdown';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordShowRightDrawerActionMenu = () => {
  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const { toggleCommandMenu } = useCommandMenu();

  return (
    <>
      {contextStoreCurrentObjectMetadataItemId && (
        <ActionMenuContext.Provider
          value={{
            isInRightDrawer: true,
            displayType: 'dropdownItem',
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
        </ActionMenuContext.Provider>
      )}
    </>
  );
};
