import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { useIcons } from 'twenty-ui/display';

import { CommandMenuPageInfoLayout } from '@/command-menu/components/CommandMenuPageInfoLayout';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuShouldFocusTitleInputComponentState } from '@/command-menu/states/commandMenuShouldFocusTitleInputComponentState';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/components/NavigationMenuItemStyleIcon';
import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/constants/FolderIconDefault';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useUpdateFolderInDraft } from '@/navigation-menu-item/hooks/useUpdateFolderInDraft';
import { useWorkspaceSectionItems } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { selectedNavigationMenuItemInEditModeStateV2 } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeStateV2';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

const StyledClickableIconWrapper = styled.div`
  cursor: pointer;
`;

export const CommandMenuFolderInfo = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const commandMenuPageInfo = useRecoilValue(commandMenuPageInfoState);
  const [shouldFocusTitleInput, setShouldFocusTitleInput] =
    useRecoilComponentState(
      commandMenuShouldFocusTitleInputComponentState,
      commandMenuPageInfo.instanceId,
    );
  const selectedNavigationMenuItemInEditMode = useRecoilValueV2(
    selectedNavigationMenuItemInEditModeStateV2,
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
          shouldFocus={shouldFocusTitleInput}
          onFocus={() => setShouldFocusTitleInput(false)}
        />
      }
      label={t`Folder`}
    />
  );
};
