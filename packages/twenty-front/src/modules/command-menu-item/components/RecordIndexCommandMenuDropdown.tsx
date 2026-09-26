import { ListItem } from 'twenty-ui/primitives/navigation';
import { COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/command-menu-item/constants/CommandMenuDropdownClickOutsideId';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { useRecordIndexCommandMenuDropdownCopyCellText } from '@/command-menu-item/hooks/useRecordIndexCommandMenuDropdownCopyCellText';
import { recordIndexCommandMenuDropdownPositionComponentState } from '@/command-menu-item/states/recordIndexCommandMenuDropdownPositionComponentState';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { IconCopy, IconLayoutSidebarRightExpand } from 'twenty-ui/icon';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

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

  const { copyToClipboard } = useCopyToClipboard();

  const copyCellText =
    useRecordIndexCommandMenuDropdownCopyCellText(dropdownId);

  const shouldShowCopyCell = isNonEmptyString(copyCellText);

  const handleCopyCell = () => {
    closeDropdown(dropdownId);
    copyToClipboard(copyCellText);
  };

  const selectedItemIdArray = [
    ...(shouldShowCopyCell ? ['copy-cell'] : []),
    ...recordIndexCommandMenuItems.map((item) => item.id),
    ...(shouldShowMoreActions ? ['more-actions'] : []),
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
      dropdownOffset={{
        x: recordIndexCommandMenuDropdownPosition.x ?? 0,
        y: recordIndexCommandMenuDropdownPosition.y ?? 0,
      }}
      dropdownComponents={
        <LegacyDropdownContent>
          <StyledDropdownMenuContainer
            data-click-outside-id={COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID}
          >
            <DropdownMenuItemsContainer>
              <SelectableList
                focusId={dropdownId}
                selectableItemIdArray={selectedItemIdArray}
                selectableListInstanceId={dropdownId}
              >
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
                  <SelectableListItem
                    itemId="more-actions"
                    key="more-actions"
                    onEnter={() => {
                      closeDropdown(dropdownId);
                      openSidePanelMenu();
                    }}
                  >
                    <ListItem
                      startIcon={<IconLayoutSidebarRightExpand />}
                      onClick={() => {
                        closeDropdown(dropdownId);
                        openSidePanelMenu();
                      }}
                      focused={selectedItemId === 'more-actions'}
                    >{t`More actions`}</ListItem>
                  </SelectableListItem>
                )}
              </SelectableList>
            </DropdownMenuItemsContainer>
          </StyledDropdownMenuContainer>
        </LegacyDropdownContent>
      }
    />
  );
};
