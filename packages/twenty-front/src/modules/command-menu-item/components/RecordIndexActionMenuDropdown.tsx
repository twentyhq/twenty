import { CommandMenuItemComponent } from '@/command-menu-item/display/components/CommandMenuItemComponent';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { ACTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/command-menu-item/constants/ActionMenuDropdownClickOutsideId';
import { CommandMenuItemContext } from '@/command-menu-item/contexts/CommandMenuItemContext';
import { ActionMenuComponentInstanceContext } from '@/command-menu-item/states/contexts/ActionMenuComponentInstanceContext';
import { recordIndexActionMenuDropdownPositionComponentState } from '@/command-menu-item/states/recordIndexActionMenuDropdownPositionComponentState';
import { getActionMenuDropdownIdFromActionMenuId } from '@/command-menu-item/utils/getActionMenuDropdownIdFromActionMenuId';
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

export const RecordIndexActionMenuDropdown = () => {
  const { t } = useLingui();
  const { actions } = useContext(CommandMenuItemContext);

  const recordIndexActions = actions.filter(
    (action) =>
      action.type === CommandMenuItemType.Standard &&
      action.scope === CommandMenuItemScope.RecordSelection,
  );

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const dropdownId = getActionMenuDropdownIdFromActionMenuId(actionMenuId);
  const { closeDropdown } = useCloseDropdown();

  const recordIndexActionMenuDropdownPosition = useAtomComponentStateValue(
    recordIndexActionMenuDropdownPositionComponentState,
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
        x: recordIndexActionMenuDropdownPosition.x ?? 0,
        y: recordIndexActionMenuDropdownPosition.y ?? 0,
      }}
      dropdownComponents={
        <DropdownContent>
          <StyledDropdownMenuContainer
            data-click-outside-id={ACTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID}
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
