import { useEffect, useState } from 'react';
import { MenuItem, MenuItemMultiSelect } from 'tsup.ui.index';

import { FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { useOptionsForSelect } from '@/object-record/object-filter-dropdown/hooks/useOptionsForSelect';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { isNonNullable } from '~/utils/isNonNullable';

export const EMPTY_FILTER_VALUE = '';
export const MAX_OPTIONS_TO_DISPLAY = 3;

type SelectOptionForFilter = FieldMetadataItemOption & {
  isSelected: boolean;
};

export const ObjectFilterDropdownOptionSelect = () => {
  const {
    filterDefinitionUsedInDropdown,
    objectFilterDropdownSearchInput,
    selectedOperandInDropdown,
    objectFilterDropdownSelectedOptionValues,
    selectFilter,
  } = useFilterDropdown();

  const fieldMetaDataId = filterDefinitionUsedInDropdown?.fieldMetadataId ?? '';

  const { selectOptions } = useOptionsForSelect(fieldMetaDataId);

  const [selectableOptions, setSelectableOptions] = useState<
    SelectOptionForFilter[]
  >([]);

  useEffect(() => {
    if (isNonNullable(selectOptions)) {
      const options = selectOptions.map((option) => {
        const isSelected =
          objectFilterDropdownSelectedOptionValues?.includes(option.value) ??
          false;

        return {
          ...option,
          isSelected,
        };
      });

      setSelectableOptions(options);
    }
  }, [objectFilterDropdownSelectedOptionValues, selectOptions]);

  const handleMultipleOptionSelectChange = (
    optionChanged: SelectOptionForFilter,
    isSelected: boolean,
  ) => {
    if (!selectOptions) {
      return;
    }

    const newSelectableOptions = selectableOptions.map((option) =>
      option.id === optionChanged.id ? { ...option, isSelected } : option,
    );

    setSelectableOptions(newSelectableOptions);

    const selectedOptions = newSelectableOptions.filter(
      (option) => option.isSelected,
    );

    const filterDisplayValue =
      selectedOptions.length > MAX_OPTIONS_TO_DISPLAY
        ? `${selectedOptions.length} options`
        : selectedOptions.map((option) => option.label).join(', ');

    if (
      isNonNullable(filterDefinitionUsedInDropdown) &&
      isNonNullable(selectedOperandInDropdown)
    ) {
      const newFilterValue =
        selectedOptions.length > 0
          ? JSON.stringify(selectedOptions.map((option) => option.value))
          : EMPTY_FILTER_VALUE;

      selectFilter({
        definition: filterDefinitionUsedInDropdown,
        operand: selectedOperandInDropdown,
        displayValue: filterDisplayValue,
        fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
        value: newFilterValue,
      });
    }
  };

  const optionsInDropdown = selectableOptions?.filter((option) =>
    option.label
      .toLowerCase()
      .includes(objectFilterDropdownSearchInput.toLowerCase()),
  );

  const showNoResult = optionsInDropdown?.length === 0;

  return (
    <DropdownMenuItemsContainer hasMaxHeight>
      {optionsInDropdown?.map((option) => (
        <MenuItemMultiSelect
          key={option.id}
          selected={option.isSelected}
          onSelectChange={(selected) =>
            handleMultipleOptionSelectChange(option, selected)
          }
          text={option.label}
          className=""
        />
      ))}
      {showNoResult && <MenuItem text="No result" />}
    </DropdownMenuItemsContainer>
  );
};
