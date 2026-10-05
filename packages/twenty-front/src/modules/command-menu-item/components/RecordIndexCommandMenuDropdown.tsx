import { CommandMenuDropdownAtCursor } from '@/command-menu-item/components/CommandMenuDropdownAtCursor';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { Dropdown } from 'twenty-ui/components';
import { IconCopy, IconLayoutSidebarRightExpand } from 'twenty-ui/icon';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
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
      {shouldShowCopyCell && (
                  <SelectableListItem
                    itemId="copy-cell"
                    onEnter={handleCopyCell}
                  >
                    <ListItem
                      startIcon={<IconCopy />}
                      onClick={handleCopyCell}
                      focused={selectedItemId === 'copy-cell'}
                    >{t`Copy cell`}</ListItem>
                  </SelectableListItem>
                )}
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
