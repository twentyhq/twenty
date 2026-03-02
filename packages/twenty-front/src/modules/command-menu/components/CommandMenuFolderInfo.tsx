import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useIcons } from 'twenty-ui/display';

import { CommandMenuPageInfoLayout } from '@/command-menu/components/CommandMenuPageInfoLayout';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuShouldFocusTitleInputComponentState } from '@/command-menu/states/commandMenuShouldFocusTitleInputComponentState';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/components/NavigationMenuItemStyleIcon';
import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/constants/FolderIconDefault';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useUpdateFolderInDraft } from '@/navigation-menu-item/hooks/useUpdateFolderInDraft';
import { useWorkspaceSectionItems } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledClickableIconWrapper = styled.div`
  cursor: pointer;
`;

export const CommandMenuFolderInfo = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const commandMenuPageInfo = useAtomStateValue(commandMenuPageInfoState);
  const [
    commandMenuShouldFocusTitleInput,
    setCommandMenuShouldFocusTitleInput,
  ] = useAtomComponentState(
    commandMenuShouldFocusTitleInputComponentState,
    commandMenuPageInfo.instanceId,
  );
  const selectedNavigationMenuItemInEditMode = useAtomStateValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const items = useWorkspaceSectionItems();
  const { updateFolderInDraft } = useUpdateFolderInDraft();

  const defaultLabel = t`New folder`;
  const placeholder = t`Folder name`;

  const selectedItem = selectedNavigationMenuItemInEditMode
    ? items.find(
        (item) =>
          item.itemType === NavigationMenuItemType.FOLDER &&
          item.id === selectedNavigationMenuItemInEditMode,
      )
    : undefined;

  if (!selectedItem) return null;

  const itemId = selectedItem.id;
  const itemName = selectedItem.name ?? defaultLabel;

  const handleChange = (text: string) => {
    updateFolderInDraft(itemId, { name: text });
  };

  const handleSave = () => {
    const trimmed = itemName.trim();
    const finalName = trimmed.length > 0 ? trimmed : defaultLabel;

    if (finalName !== itemName) {
      updateFolderInDraft(itemId, { name: finalName });
    }
  };

  const selectedIconKey = selectedItem.icon ?? FOLDER_ICON_DEFAULT;
  const FolderIconComponent = getIcon(selectedIconKey);

  return (
    <CommandMenuPageInfoLayout
      icon={
        <IconPicker
          dropdownId="command-menu-folder-icon-picker"
          selectedIconKey={selectedIconKey}
          onChange={({ iconKey }) =>
            updateFolderInDraft(itemId, { icon: iconKey })
          }
          clickableComponent={
            <StyledClickableIconWrapper>
              <NavigationMenuItemStyleIcon
                Icon={FolderIconComponent}
                color={selectedItem.color}
              />
            </StyledClickableIconWrapper>
          }
        />
      }
      title={
        <TitleInput
          instanceId={`folder-name-${itemId}`}
          sizeVariant="sm"
          value={itemName}
          onChange={handleChange}
          placeholder={placeholder}
          onEnter={handleSave}
          onEscape={handleSave}
          onClickOutside={handleSave}
          onTab={handleSave}
          onShiftTab={handleSave}
          shouldFocus={commandMenuShouldFocusTitleInput}
          onFocus={() => setCommandMenuShouldFocusTitleInput(false)}
        />
      }
      label={t`Folder`}
    />
  );
};
