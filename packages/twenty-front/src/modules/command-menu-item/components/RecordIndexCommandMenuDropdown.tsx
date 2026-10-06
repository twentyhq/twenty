import { CommandMenuDropdownAtCursor } from '@/command-menu-item/components/CommandMenuDropdownAtCursor';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useRecordIndexCommandMenuDropdownCopyCellText } from '@/command-menu-item/hooks/useRecordIndexCommandMenuDropdownCopyCellText';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
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

  const commandMenuId = useAvailableComponentInstanceIdOrThrow(
    CommandMenuComponentInstanceContext,
  );
  const { closeDropdown } = useCloseDropdown();
  const { copyToClipboard } = useCopyToClipboard();
  const copyCellText = useRecordIndexCommandMenuDropdownCopyCellText();

  const handleCopyCell = () => {
    copyToClipboard(copyCellText);
    closeDropdown(getCommandMenuDropdownIdFromCommandMenuId(commandMenuId));
  };

  return (
    <CommandMenuDropdownAtCursor>
      {isNonEmptyString(copyCellText) && (
        <Dropdown.ActionItem startIcon={<IconCopy />} onClick={handleCopyCell}>
          {t`Copy cell`}
        </Dropdown.ActionItem>
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
