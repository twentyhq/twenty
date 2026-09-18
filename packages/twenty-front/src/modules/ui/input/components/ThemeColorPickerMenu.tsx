import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import {
  DEFAULT_COLOR_LABELS,
  MenuItemSelectColor,
} from 'twenty-ui/primitives/navigation';
import { type ThemeColor, MAIN_COLOR_NAMES } from 'twenty-ui/theme';

type ThemeColorPickerMenuProps = {
  selectedColor: ThemeColor;
  onSelectColor: (color: ThemeColor) => void;
};

export const ThemeColorPickerMenu = ({
  selectedColor,
  onSelectColor,
}: ThemeColorPickerMenuProps) => {
  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );
  const selectableListInstanceId = `${dropdownId}-colors`;
  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    selectableListInstanceId,
  );
  const [searchValue, setSearchValue] = useState('');

  const query = searchValue.trim().toLowerCase();

  const filteredColorNames = isNonEmptyString(query)
    ? MAIN_COLOR_NAMES.filter(
        (colorName) =>
          colorName.toLowerCase().includes(query) ||
          (DEFAULT_COLOR_LABELS[colorName] ?? '').toLowerCase().includes(query),
      )
    : MAIN_COLOR_NAMES;

  return (
    <>
      <DropdownMenuSearchInput
        placeholder={t`Search colors...`}
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
      />
      <DropdownMenuSeparator />
      <SelectableList
        selectableListInstanceId={selectableListInstanceId}
        focusId={dropdownId}
        selectableItemIdArray={filteredColorNames}
      >
        <DropdownMenuItemsContainer hasMaxHeight>
          {filteredColorNames.map((colorName) => (
            <SelectableListItem
              key={colorName}
              itemId={colorName}
              onEnter={() => onSelectColor(colorName)}
            >
              <MenuItemSelectColor
                focused={selectedItemId === colorName}
                onClick={() => onSelectColor(colorName)}
                color={colorName}
                selected={colorName === selectedColor}
                colorLabels={DEFAULT_COLOR_LABELS}
              />
            </SelectableListItem>
          ))}
        </DropdownMenuItemsContainer>
      </SelectableList>
    </>
  );
};
