import { CommandMenuDropdownAtCursor } from '@/command-menu-item/components/CommandMenuDropdownAtCursor';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';
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

  const { openSidePanelMenu } = useSidePanelMenu();

  return (
    <CommandMenuDropdownAtCursor>
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
    </CommandMenuDropdownAtCursor>
  );
};
