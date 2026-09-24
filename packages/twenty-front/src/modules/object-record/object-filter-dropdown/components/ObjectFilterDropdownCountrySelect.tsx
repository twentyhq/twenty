import { ListItem } from 'twenty-ui/primitives/navigation';
import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { getCountryFlagMenuItemAvatar } from '@/object-record/object-filter-dropdown/utils/getCountryFlagMenuItemAvatar';
import { turnCountryIntoSelectableItem } from '@/object-record/object-filter-dropdown/utils/turnCountryIntoSelectableItem';
import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ChangeEvent, useState } from 'react';
import { isDefined, parseJson } from 'twenty-shared/utils';
import { z } from 'zod';

export const EMPTY_FILTER_VALUE = '[]';
export const MAX_ITEMS_TO_DISPLAY = 5;

export const ObjectFilterDropdownCountrySelect = () => {
  const [searchText, setSearchText] = useState('');

  const objectFilterDropdownCurrentRecordFilter = useAtomComponentStateValue(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const fieldMetadataItemUsedInFilterDropdown = useAtomComponentSelectorValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const countries = useCountries();

  const countriesAsSelectableItems = countries.map(
    turnCountryIntoSelectableItem,
  );

  const selectedCountryNames = isNonEmptyString(
    objectFilterDropdownCurrentRecordFilter?.value,
  )
    ? (z
        .array(z.string())
        .safeParse(parseJson(objectFilterDropdownCurrentRecordFilter.value))
        .data ?? [])
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
    <LegacyDropdownContent
      widthInPixels={GenericDropdownContentWidth.ExtraLarge}
    >
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
      <DropdownMenuItemsContainer isMultiSelect hasMaxHeight>
        {filteredSelectedItems?.map((item) => {
          return (
            <ListItem
              render={<button type="button" />}
              key={item.id}
              role="option"
              aria-selected={true}
              selected={true}
              indicator="checkbox"
              onClick={() => {
                handleMultipleItemSelectChange(item, false);
              }}
              startIcon={getCountryFlagMenuItemAvatar(item.name, countries)}
            >
              {item.name}
            </ListItem>
          );
        })}
        {filteredSelectableItems?.map((item) => {
          return (
            <ListItem
              render={<button type="button" />}
              key={item.id}
              role="option"
              aria-selected={false}
              selected={false}
              indicator="checkbox"
              onClick={() => {
                handleMultipleItemSelectChange(item, true);
              }}
              startIcon={getCountryFlagMenuItemAvatar(item.name, countries)}
            >
              {item.name}
            </ListItem>
          );
        })}
        {showNoResult && <ListItem disabled>{t`No results`}</ListItem>}
      </DropdownMenuItemsContainer>
    </LegacyDropdownContent>
  );
};
