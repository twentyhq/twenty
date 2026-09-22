import { COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/command-menu-item/constants/CommandMenuDropdownClickOutsideId';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { recordIndexCommandMenuDropdownPositionComponentState } from '@/command-menu-item/states/recordIndexCommandMenuDropdownPositionComponentState';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconLayoutSidebarRightExpand } from 'twenty-ui/icon';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';
import { Menu } from 'twenty-ui/primitives/surfaces';

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
  const workspaceSurface = useWorkspaceSurface();
  const shouldShowMoreActions = workspaceSurface.type === 'main';

  const recordIndexCommandMenuItems = commandMenuItems.filter(
    (item) =>
      item.availabilityType ===
      CommandMenuItemAvailabilityType.RECORD_SELECTION,
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
  return (
    <DropdownMenu
      dropdownId={dropdownId}
      data-select-disable
      dropdownPlacement="bottom-start"
      dropdownOffset={{
        x: recordIndexCommandMenuDropdownPosition.x ?? 0,
        y: recordIndexCommandMenuDropdownPosition.y ?? 0,
      }}
      dropdownComponents={
        <DropdownContent>
          <StyledDropdownMenuContainer
            data-click-outside-id={COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID}
          >
            <Menu.Group>
              {recordIndexCommandMenuItems.map((item) => (
                <CommandMenuItemRenderer item={item} key={item.id} />
              ))}
              {shouldShowMoreActions && (
                <Menu.Item
                  startIcon={<IconLayoutSidebarRightExpand />}
                  onClick={() => {
                    closeDropdown(dropdownId);
                    openSidePanelMenu();
                  }}
                >{t`More actions`}</Menu.Item>
              )}
            </Menu.Group>
          </StyledDropdownMenuContainer>
        </DropdownContent>
      }
    />
  );
};
