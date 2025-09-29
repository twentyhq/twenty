import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { capitalize } from 'twenty-shared/utils';
import { ColorSample } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { MAIN_COLOR_NAMES, type ThemeColor } from 'twenty-ui/theme';

export const ChartColorSelectionDropdownContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const currentColorScheme = widgetInEditMode?.configuration?.colorScheme;

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const colorOptions = MAIN_COLOR_NAMES.map((colorName) => ({
    id: colorName,
    name: capitalize(colorName),
    colorName: colorName as ThemeColor,
  }));

  const filteredColorOptions = colorOptions.filter((colorOption) => {
    const matchesSearch =
      !isNonEmptyString(searchQuery) ||
      colorOption.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const handleSelectColor = (colorName: ThemeColor) => {
    updateCurrentWidgetConfig({
      color: colorName,
    });
    closeDropdown();
  };

  return (
    <>
      <DropdownMenuHeader>Colors</DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder="Search colors"
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={filteredColorOptions.map(
            (colorOption) => colorOption.id,
          )}
        >
          {filteredColorOptions.map((colorOption) => (
            <SelectableListItem
              key={colorOption.id}
              itemId={colorOption.id}
              onEnter={() => {
                handleSelectColor(colorOption.colorName);
              }}
            >
              <MenuItemSelect
                text={colorOption.name}
                selected={currentColorScheme === colorOption.id}
                focused={selectedItemId === colorOption.id}
                LeftIcon={() => (
                  <ColorSample colorName={colorOption.colorName} />
                )}
                onClick={() => {
                  handleSelectColor(colorOption.colorName);
                }}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
