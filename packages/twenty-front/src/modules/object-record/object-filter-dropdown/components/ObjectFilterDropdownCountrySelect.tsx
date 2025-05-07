import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { getCountryFlagMenuItemAvatar } from '@/object-record/object-filter-dropdown/utils/getCountryFlagMenuItemAvatar';
import { turnCountryIntoSelectableItem } from '@/object-record/object-filter-dropdown/utils/turnCountryIntoSelectableItem';
import { SelectableItem } from '@/object-record/select/types/SelectableItem';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ChangeEvent, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem, MenuItemMultiSelectAvatar } from 'twenty-ui/navigation';

export const EMPTY_FILTER_VALUE = '[]';
export const MAX_ITEMS_TO_DISPLAY = 5;

type ObjectFilterDropdownCountrySelectProps = {
  dropdownWidth?: number;
};

export const ObjectFilterDropdownCountrySelect = ({
  dropdownWidth,
}: ObjectFilterDropdownCountrySelectProps) => {
  const [searchText, setSearchText] = useState('');

  const objectFilterDropdownCurrentRecordFilter = useRecoilComponentValueV2(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const fieldMetadataItemUsedInFilterDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const countries = useCountries();

  const countriesAsSelectableItems = countries.map(
    turnCountryIntoSelectableItem,
  );

  const selectedCountryNames = isNonEmptyString(
    objectFilterDropdownCurrentRecordFilter?.value,
  )
    ? (JSON.parse(objectFilterDropdownCurrentRecordFilter.value) as string[]) // TODO: replace by a safe parse
    : [];

  const filteredSelectableItems = countriesAsSelectableItems.filter(
    (selectableItem) =>
      selectableItem.name.toLowerCase().includes(searchText.toLowerCase()) &&
      !selectedCountryNames.includes(selectableItem.name),
  );

  const filteredSelectedItems = countriesAsSelectableItems.filter(
    (selectableItem) =>
      selectableItem.name.toLowerCase().includes(searchText.toLowerCase()) &&
      selectedCountryNames.includes(selectableItem.name),
  );

  const handleMultipleItemSelectChange = (
    itemToSelect: SelectableItem,
    newSelectedValue: boolean,
  ) => {
    const newSelectedItemNames = newSelectedValue
      ? [...selectedCountryNames, itemToSelect.name]
      : selectedCountryNames.filter((name) => name !== itemToSelect.name);

    if (!isDefined(fieldMetadataItemUsedInFilterDropdown)) {
      throw new Error(
        'Field metadata item used in filter dropdown should be defined',
      );
    }

    const selectedItemNames = countriesAsSelectableItems
      .filter((option) => newSelectedItemNames.includes(option.name))
      .map((option) => option.name);

    const filterDisplayValue =
      selectedItemNames.length > MAX_ITEMS_TO_DISPLAY
        ? `${selectedItemNames.length} countries`
        : selectedItemNames.join(', ');

    const newFilterValue =
      newSelectedItemNames.length > 0
        ? JSON.stringify(selectedItemNames)
        : EMPTY_FILTER_VALUE;

    applyObjectFilterDropdownFilterValue(newFilterValue, filterDisplayValue);
  };

  const showNoResult =
    filteredSelectableItems.length === 0 &&
    filteredSelectedItems.length === 0 &&
    searchText !== '';

  const { t } = useLingui();

  return (
    <>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        value={searchText}
        placeholder={t`Search country`}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setSearchText(event.target.value);
        }}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight width={dropdownWidth ?? 200}>
        {filteredSelectedItems?.map((item) => {
          return (
            <MenuItemMultiSelectAvatar
              key={item.id}
              selected={true}
              onSelectChange={(newCheckedValue) => {
                handleMultipleItemSelectChange(item, newCheckedValue);
              }}
              text={item.name}
              avatar={getCountryFlagMenuItemAvatar(item.name, countries)}
            />
          );
        })}
        {filteredSelectableItems?.map((item) => {
          return (
            <MenuItemMultiSelectAvatar
              key={item.id}
              selected={false}
              onSelectChange={(newCheckedValue) => {
                handleMultipleItemSelectChange(item, newCheckedValue);
              }}
              text={item.name}
              avatar={getCountryFlagMenuItemAvatar(item.name, countries)}
            />
          );
        })}
        {showNoResult && <MenuItem text={t`No results`} />}
      </DropdownMenuItemsContainer>
    </>
  );
};
