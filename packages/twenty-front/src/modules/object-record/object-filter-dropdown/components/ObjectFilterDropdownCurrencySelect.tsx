import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownSelectedRecordIdsComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSelectedRecordIdsComponentState';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { turnCurrencyIntoSelectableItem } from '@/object-record/object-filter-dropdown/utils/turnCurrencyIntoSelectableItem';
import { useApplyRecordFilter } from '@/object-record/record-filter/hooks/useApplyRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { findDuplicateRecordFilterInNonAdvancedRecordFilters } from '@/object-record/record-filter/utils/findDuplicateRecordFilterInNonAdvancedRecordFilters';
import { StyledMultipleSelectDropdownAvatarChip } from '@/object-record/select/components/StyledMultipleSelectDropdownAvatarChip';
import { SelectableItem } from '@/object-record/select/types/SelectableItem';
import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useLingui } from '@lingui/react/macro';
import { ChangeEvent, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem, MenuItemMultiSelectAvatar } from 'twenty-ui/navigation';
import { v4 } from 'uuid';

export const EMPTY_FILTER_VALUE = '[]';
export const MAX_ITEMS_TO_DISPLAY = 3;

type ObjectFilterDropdownCurrencySelectProps = {
  viewComponentId?: string;
  dropdownWidth?: number;
};

export const ObjectFilterDropdownCurrencySelect = ({
  viewComponentId,
  dropdownWidth,
}: ObjectFilterDropdownCurrencySelectProps) => {
  const [searchText, setSearchText] = useState('');

  const selectedFilter = useRecoilComponentValueV2(
    selectedFilterComponentState,
  );

  const setObjectFilterDropdownSelectedRecordIds = useSetRecoilComponentStateV2(
    objectFilterDropdownSelectedRecordIdsComponentState,
    selectedFilter?.id,
  );

  const objectFilterDropdownSelectedRecordIds = useRecoilComponentValueV2(
    objectFilterDropdownSelectedRecordIdsComponentState,
    selectedFilter?.id,
  );

  const selectedOperandInDropdown = useRecoilComponentValueV2(
    selectedOperandInDropdownComponentState,
  );

  const fieldMetadataItemUsedInFilterDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const { applyRecordFilter } = useApplyRecordFilter(viewComponentId);

  const currenciesAsSelectableItems = CURRENCIES.map(
    turnCurrencyIntoSelectableItem,
  );

  const filteredSelectableItems = currenciesAsSelectableItems.filter(
    (selectableItem) =>
      selectableItem.name.toLowerCase().includes(searchText.toLowerCase()) &&
      !objectFilterDropdownSelectedRecordIds.includes(selectableItem.id),
  );

  const filteredSelectedItems = currenciesAsSelectableItems.filter(
    (selectableItem) =>
      selectableItem.name.toLowerCase().includes(searchText.toLowerCase()) &&
      objectFilterDropdownSelectedRecordIds.includes(selectableItem.id),
  );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const handleMultipleItemSelectChange = (
    itemToSelect: SelectableItem,
    newSelectedValue: boolean,
  ) => {
    const newSelectedItemIds = newSelectedValue
      ? [...objectFilterDropdownSelectedRecordIds, itemToSelect.id]
      : objectFilterDropdownSelectedRecordIds.filter(
          (id) => id !== itemToSelect.id,
        );

    if (!isDefined(fieldMetadataItemUsedInFilterDropdown)) {
      throw new Error(
        'Field metadata item used in filter dropdown should be defined',
      );
    }

    setObjectFilterDropdownSelectedRecordIds(newSelectedItemIds);

    const selectedItemNames = currenciesAsSelectableItems
      .filter((option) => newSelectedItemIds.includes(option.id))
      .map((option) => option.name);

    const filterDisplayValue =
      selectedItemNames.length > MAX_ITEMS_TO_DISPLAY
        ? `${selectedItemNames.length} currencies`
        : selectedItemNames.join(', ');

    if (
      isDefined(fieldMetadataItemUsedInFilterDropdown) &&
      isDefined(selectedOperandInDropdown)
    ) {
      const newFilterValue =
        newSelectedItemIds.length > 0
          ? JSON.stringify(newSelectedItemIds)
          : EMPTY_FILTER_VALUE;

      const duplicateFilterInCurrentRecordFilters =
        findDuplicateRecordFilterInNonAdvancedRecordFilters({
          recordFilters: currentRecordFilters,
          fieldMetadataItemId: fieldMetadataItemUsedInFilterDropdown.id,
          subFieldName: 'currencyCode',
        });

      const filterIsAlreadyInCurrentRecordFilters = isDefined(
        duplicateFilterInCurrentRecordFilters,
      );

      const filterId = filterIsAlreadyInCurrentRecordFilters
        ? duplicateFilterInCurrentRecordFilters?.id
        : v4();

      applyRecordFilter({
        id: selectedFilter?.id ? selectedFilter.id : filterId,
        type: getFilterTypeFromFieldType(
          fieldMetadataItemUsedInFilterDropdown.type,
        ),
        label: fieldMetadataItemUsedInFilterDropdown.label,
        operand: selectedOperandInDropdown || ViewFilterOperand.Is,
        displayValue: filterDisplayValue,
        fieldMetadataId: fieldMetadataItemUsedInFilterDropdown.id,
        value: newFilterValue,
        recordFilterGroupId: selectedFilter?.recordFilterGroupId,
        subFieldName: 'currencyCode',
        positionInRecordFilterGroup:
          selectedFilter?.positionInRecordFilterGroup,
      });
    }
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
        placeholder={t`Search currency`}
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
              avatar={
                <StyledMultipleSelectDropdownAvatarChip
                  className="avatar-icon-container"
                  name={item.name}
                  avatarUrl={item.avatarUrl}
                  LeftIcon={item.AvatarIcon}
                  avatarType={item.avatarType}
                  isIconInverted={item.isIconInverted}
                  placeholderColorSeed={item.id}
                />
              }
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
              avatar={
                <StyledMultipleSelectDropdownAvatarChip
                  className="avatar-icon-container"
                  name={item.name}
                  avatarUrl={item.avatarUrl}
                  LeftIcon={item.AvatarIcon}
                  avatarType={item.avatarType}
                  isIconInverted={item.isIconInverted}
                  placeholderColorSeed={item.id}
                />
              }
            />
          );
        })}
        {showNoResult && <MenuItem text={t`No results`} />}
      </DropdownMenuItemsContainer>
    </>
  );
};
