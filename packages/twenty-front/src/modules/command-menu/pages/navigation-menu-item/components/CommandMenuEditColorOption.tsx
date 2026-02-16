import { useLingui } from '@lingui/react/macro';
import { capitalize } from 'twenty-shared/utils';
import { IconColorSwatch } from 'twenty-ui/display';
import { type ColorLabels, MenuItemSelectColor } from 'twenty-ui/navigation';
import { MAIN_COLOR_NAMES, type ThemeColor } from 'twenty-ui/theme';

import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { useUpdateNavigationMenuItemInDraft } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItemInDraft';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

const NAVIGATION_MENU_ITEM_COLOR_DROPDOWN_ID = 'navigation-menu-item-color';

const COLOR_LABELS: ColorLabels = {
  gray: 'Gray',
  tomato: 'Tomato',
  red: 'Red',
  ruby: 'Ruby',
  crimson: 'Crimson',
  pink: 'Pink',
  plum: 'Plum',
  purple: 'Purple',
  violet: 'Violet',
  iris: 'Iris',
  cyan: 'Cyan',
  turquoise: 'Turquoise',
  sky: 'Sky',
  blue: 'Blue',
  jade: 'Jade',
  green: 'Green',
  grass: 'Grass',
  mint: 'Mint',
  lime: 'Lime',
  bronze: 'Bronze',
  gold: 'Gold',
  brown: 'Brown',
  orange: 'Orange',
  amber: 'Amber',
  yellow: 'Yellow',
};

type CommandMenuEditColorOptionProps = {
  navigationMenuItemId: string;
  color: string | null | undefined;
};

export const CommandMenuEditColorOption = ({
  navigationMenuItemId,
  color,
}: CommandMenuEditColorOptionProps) => {
  const { t } = useLingui();
  const { updateNavigationMenuItemInDraft } =
    useUpdateNavigationMenuItemInDraft();
  const { closeDropdown } = useCloseDropdown();

  const themeColor = (color ?? 'gray') as ThemeColor;
  const colorLabel = COLOR_LABELS[themeColor] ?? capitalize(themeColor);

  const handleSelectColor = (selectedColor: ThemeColor) => {
    updateNavigationMenuItemInDraft(navigationMenuItemId, {
      color: selectedColor,
    });
    closeDropdown(NAVIGATION_MENU_ITEM_COLOR_DROPDOWN_ID);
  };

  return (
    <CommandMenuItemDropdown
      id="edit-navigation-menu-item-color"
      label={t`Color`}
      Icon={IconColorSwatch}
      dropdownId={NAVIGATION_MENU_ITEM_COLOR_DROPDOWN_ID}
      dropdownPlacement="bottom-start"
      RightComponent={colorLabel}
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            {MAIN_COLOR_NAMES.map((colorName) => (
              <MenuItemSelectColor
                key={colorName}
                onClick={() => handleSelectColor(colorName)}
                color={colorName}
                selected={colorName === themeColor}
                colorLabels={COLOR_LABELS}
              />
            ))}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
