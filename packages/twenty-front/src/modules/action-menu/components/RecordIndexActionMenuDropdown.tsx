import { ActionDisplayer } from '@/action-menu/actions/display/components/ActionDisplayer';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { recordIndexActionMenuDropdownPositionComponentState } from '@/action-menu/states/recordIndexActionMenuDropdownPositionComponentState';
import { ActionMenuDropdownHotkeyScope } from '@/action-menu/types/ActionMenuDropdownHotKeyScope';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { IconLayoutSidebarRightExpand } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

const StyledDropdownMenuContainer = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const RecordIndexActionMenuDropdown = () => {
  const { actions } = useContext(ActionMenuContext);

  const recordIndexActions = actions.filter(
    (action) =>
      action.type === ActionMenuEntryType.Standard &&
      action.scope === ActionMenuEntryScope.RecordSelection,
  );

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const dropdownId = getActionMenuDropdownIdFromActionMenuId(actionMenuId);
  const { closeDropdown } = useDropdown(dropdownId);

  const actionMenuDropdownPosition = useRecoilValue(
    extractComponentState(
      recordIndexActionMenuDropdownPositionComponentState,
      dropdownId,
    ),
  );

  const { openCommandMenu } = useCommandMenu();

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownHotkeyScope={{
        scope: ActionMenuDropdownHotkeyScope.ActionMenuDropdown,
      }}
      data-select-disable
      dropdownPlacement="bottom-start"
      dropdownStrategy="absolute"
      dropdownOffset={{
        x: actionMenuDropdownPosition.x ?? 0,
        y: actionMenuDropdownPosition.y ?? 0,
      }}
      dropdownComponents={
        <StyledDropdownMenuContainer className="action-menu-dropdown">
          <DropdownMenuItemsContainer>
            {recordIndexActions.map((action) => (
              <ActionDisplayer action={action} />
            ))}
            <MenuItem
              key="more-actions"
              LeftIcon={IconLayoutSidebarRightExpand}
              onClick={() => {
                closeDropdown();
                openCommandMenu();
              }}
              text="More actions"
            />
          </DropdownMenuItemsContainer>
        </StyledDropdownMenuContainer>
      }
    />
  );
};
