import { COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/command-menu-item/constants/CommandMenuDropdownClickOutsideId';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { recordIndexCommandMenuDropdownPositionComponentState } from '@/command-menu-item/states/recordIndexCommandMenuDropdownPositionComponentState';
import { createVirtualElementFromPosition } from '@/command-menu-item/utils/createVirtualElementFromPosition';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { Dropdown } from 'twenty-ui/components';
import { IconLayoutSidebarRightExpand } from 'twenty-ui/icon';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

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

  const recordIndexCommandMenuDropdownPosition = useAtomComponentStateValue(
    recordIndexCommandMenuDropdownPositionComponentState,
    dropdownId,
  );

  const { openSidePanelMenu } = useSidePanelMenu();

  return (
    <DropdownRoot dropdownId={dropdownId} type="menu">
      <DropdownContent
        anchor={createVirtualElementFromPosition(
          recordIndexCommandMenuDropdownPosition,
        )}
        aria-label={t`Actions`}
      >
        <Dropdown.Section
          data-click-outside-id={COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID}
        >
          {recordIndexCommandMenuItems.map((item) => (
            <CommandMenuItemRenderer item={item} key={item.id} />
          ))}
          {shouldShowMoreActions && (
            <Dropdown.ActionItem
              startIcon={<IconLayoutSidebarRightExpand />}
              onClick={() => openSidePanelMenu()}
            >
              {t`More actions`}
            </Dropdown.ActionItem>
          )}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
