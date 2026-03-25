import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useIcons } from 'twenty-ui/display';

import { SidePanelPageInfoLayout } from '@/side-panel/components/SidePanelPageInfoLayout';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelShouldFocusTitleInputComponentState } from '@/side-panel/states/sidePanelShouldFocusTitleInputComponentState';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemStyleIcon';
import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/FolderIconDefault';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { useUpdateFolderInDraft } from '@/navigation-menu-item/edit/folder/hooks/useUpdateFolderInDraft';
import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledClickableIconWrapper = styled.div`
  cursor: pointer;
`;

export const SidePanelFolderInfo = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const sidePanelPageInfo = useAtomStateValue(sidePanelPageInfoState);
  const [sidePanelShouldFocusTitleInput, setSidePanelShouldFocusTitleInput] =
    useAtomComponentState(
      sidePanelShouldFocusTitleInputComponentState,
      sidePanelPageInfo.instanceId,
    );
  const selectedNavigationMenuItemIdInEditMode = useAtomStateValue(
    selectedNavigationMenuItemIdInEditModeState,
  );
  const items = useNavigationMenuItemSectionItems();
  const { updateFolderInDraft } = useUpdateFolderInDraft();

  const defaultLabel = t`New folder`;
  const placeholder = t`Folder name`;

  const selectedItem = selectedNavigationMenuItemIdInEditMode
    ? items.find(
        (item) =>
          item.type === NavigationMenuItemType.FOLDER &&
          item.id === selectedNavigationMenuItemIdInEditMode,
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
    <SidePanelPageInfoLayout
      icon={
        <IconPicker
          dropdownId="side-panel-folder-icon-picker"
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
          shouldFocus={sidePanelShouldFocusTitleInput}
          onFocus={() => setSidePanelShouldFocusTitleInput(false)}
        />
      }
      label={t`Folder`}
    />
  );
};
