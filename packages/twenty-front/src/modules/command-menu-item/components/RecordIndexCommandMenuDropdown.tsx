import { CommandMenuItemComponent } from '@/command-menu-item/display/components/CommandMenuItemComponent';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/command-menu-item/constants/CommandMenuDropdownClickOutsideId';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { recordIndexCommandMenuDropdownPositionComponentState } from '@/command-menu-item/states/recordIndexCommandMenuDropdownPositionComponentState';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconLayoutSidebarRightExpand } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

const StyledDropdownMenuContainer = styled.div`
  align-items: center;
  display: flex;

  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

export const RecordIndexCommandMenuDropdown = () => {
  const { t } = useLingui();
  const { commandMenuItems } = useContext(CommandMenuContext);

  const recordIndexActions = commandMenuItems.filter(
    (action) =>
      action.type === CommandMenuItemType.Standard &&
      action.scope === CommandMenuItemScope.RecordSelection,
  );

  const commandMenuId = useAvailableComponentInstanceIdOrThrow(
    CommandMenuComponentInstanceContext,
  );

  const dropdownId = getCommandMenuDropdownIdFromCommandMenuId(commandMenuId);
  const { closeDropdown } = useCloseDropdown();

  const recordIndexCommandMenuDropdownPosition = useAtomComponentStateValue(
    recordIndexCommandMenuDropdownPositionComponentState,
    dropdownId,
  );

  const { openSidePanelMenu } = useSidePanelMenu();

  const selectedItemIdArray = [
    ...recordIndexActions.map((action) => action.key),
    'more-actions',
  ];

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  return (
    <Dropdown
      dropdownId={dropdownId}
      data-select-disable
      dropdownPlacement="bottom-start"
      dropdownStrategy="absolute"
      dropdownOffset={{
        x: recordIndexCommandMenuDropdownPosition.x ?? 0,
        y: recordIndexCommandMenuDropdownPosition.y ?? 0,
      }}
      dropdownComponents={
        <DropdownContent>
          <StyledDropdownMenuContainer
            data-click-outside-id={COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID}
          >
            <DropdownMenuItemsContainer>
              <SelectableList
                focusId={dropdownId}
                selectableItemIdArray={selectedItemIdArray}
                selectableListInstanceId={dropdownId}
              >
                {recordIndexActions.map((action) => (
                  <CommandMenuItemComponent action={action} key={action.key} />
                ))}
                <SelectableListItem
                  itemId="more-actions"
                  key="more-actions"
                  onEnter={() => {
                    closeDropdown(dropdownId);
                    openSidePanelMenu();
                  }}
                >
                  <MenuItem
                    LeftIcon={IconLayoutSidebarRightExpand}
                    onClick={() => {
                      closeDropdown(dropdownId);
                      openSidePanelMenu();
                    }}
                    focused={selectedItemId === 'more-actions'}
                    text={t`More actions`}
                  />
                </SelectableListItem>
              </SelectableList>
            </DropdownMenuItemsContainer>
          </StyledDropdownMenuContainer>
        </DropdownContent>
      }
    />
  );
};
