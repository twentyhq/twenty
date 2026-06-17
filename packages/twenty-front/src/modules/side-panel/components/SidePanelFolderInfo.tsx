import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { TintedIconTile, useIcons } from 'twenty-ui/display';

import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/FolderIconDefault';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useNavigationMenuItemEditSectionItems } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditSectionItems';
import { useNavigationMenuItemTitleEdit } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemTitleEdit';
import { SidePanelPageInfoLayout } from '@/side-panel/components/SidePanelPageInfoLayout';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelShouldFocusTitleInputComponentState } from '@/side-panel/states/sidePanelShouldFocusTitleInputComponentState';
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
  const items = useNavigationMenuItemEditSectionItems();
  const { updateItem } = useNavigationMenuItemEditController();

  const defaultLabel = t`New folder`;
  const placeholder = t`Folder name`;

  const selectedItem = selectedNavigationMenuItemIdInEditMode
    ? items.find(
        (item) =>
          item.type === NavigationMenuItemType.FOLDER &&
          item.id === selectedNavigationMenuItemIdInEditMode,
      )
    : undefined;

  const { value, handleChange, handleSave } = useNavigationMenuItemTitleEdit({
    itemId: selectedItem?.id ?? null,
    itemName: selectedItem?.name ?? defaultLabel,
    defaultLabel,
    persistName: (name) => {
      if (isDefined(selectedItem)) {
        void updateItem(selectedItem.id, { name });
      }
    },
  });

  if (!isDefined(selectedItem)) return null;

  const selectedIconKey = selectedItem.icon ?? FOLDER_ICON_DEFAULT;
  const FolderIconComponent = getIcon(selectedIconKey);

  return (
    <SidePanelPageInfoLayout
      icon={
        <IconPicker
          dropdownId="side-panel-folder-icon-picker"
          selectedIconKey={selectedIconKey}
          onChange={({ iconKey }) =>
            void updateItem(selectedItem.id, { icon: iconKey })
          }
          clickableComponent={
            <StyledClickableIconWrapper>
              <TintedIconTile
                Icon={FolderIconComponent}
                color={selectedItem.color}
              />
            </StyledClickableIconWrapper>
          }
        />
      }
      title={
        <TitleInput
          instanceId={`folder-name-${selectedItem.id}`}
          sizeVariant="sm"
          value={value}
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
