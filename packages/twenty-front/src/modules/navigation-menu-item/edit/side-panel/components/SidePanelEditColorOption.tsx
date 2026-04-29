import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { isValidObjectNavigationMenuItem } from '@/navigation-menu-item/common/utils/isValidObjectNavigationMenuItem';
import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/edit/hooks/useSelectedNavigationMenuItemEditItem';
import { useUpdateNavigationMenuItemInDraft } from '@/navigation-menu-item/edit/hooks/useUpdateNavigationMenuItemInDraft';
import { ThemeColorPickerMenu } from '@/ui/input/components/ThemeColorPickerMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { capitalize } from 'twenty-shared/utils';
import { IconColorSwatch } from 'twenty-ui/display';
import { DEFAULT_COLOR_LABELS } from 'twenty-ui/navigation';
import { type ThemeColor } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const NAVIGATION_MENU_ITEM_COLOR_DROPDOWN_ID = 'navigation-menu-item-color';

const StyledMenuStyleText = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: 13px;
`;

type SidePanelEditColorOptionProps = {
  navigationMenuItemId: string;
  color: ThemeColor;
};

export const SidePanelEditColorOption = ({
  navigationMenuItemId,
  color,
}: SidePanelEditColorOptionProps) => {
  const { t } = useLingui();
  const { updateNavigationMenuItemInDraft } =
    useUpdateNavigationMenuItemInDraft();
  const { closeDropdown } = useCloseDropdown();
  const { updateInDraft, applyChanges } = useUpdateMetadataStoreDraft();
  const { selectedItem } = useSelectedNavigationMenuItemEditItem();

  const themeColor = color ?? 'gray';
  const colorLabel = DEFAULT_COLOR_LABELS[themeColor] ?? capitalize(themeColor);

  const handleSelectColor = (selectedColor: ThemeColor) => {
    updateNavigationMenuItemInDraft(navigationMenuItemId, {
      color: selectedColor,
    });

    if (isValidObjectNavigationMenuItem(selectedItem)) {
      updateInDraft('objectMetadataItems', [
        {
          id: selectedItem.targetObjectMetadataId,
          color: selectedColor,
        } as FlatObjectMetadataItem,
      ]);
      applyChanges();
    }

    closeDropdown(NAVIGATION_MENU_ITEM_COLOR_DROPDOWN_ID);
  };

  return (
    <CommandMenuItemDropdown
      id="edit-navigation-menu-item-color"
      label={t`Color`}
      Icon={IconColorSwatch}
      dropdownId={NAVIGATION_MENU_ITEM_COLOR_DROPDOWN_ID}
      dropdownPlacement="bottom-start"
      RightComponent={<StyledMenuStyleText>{colorLabel}</StyledMenuStyleText>}
      dropdownComponents={
        <DropdownContent>
          <ThemeColorPickerMenu
            selectedColor={themeColor}
            onSelectColor={handleSelectColor}
          />
        </DropdownContent>
      }
    />
  );
};
