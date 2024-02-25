import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { MultipleOptionSelectDropdown } from '@/object-record/select/components/MultipleOptionSelectDropdown';
import { useOptionsForSelect } from '@/object-record/select/hooks/useOptionsForSelect';
import { SelectableOption } from '@/object-record/select/types/SelectableOption';

export const EMPTY_FILTER_VALUE = '';
export const MAX_OPTIONS_TO_DISPLAY = 3;

export const ObjectFilterDropdownOptionSelect = () => {
  const {
    filterDefinitionUsedInDropdown,
    objectFilterDropdownSearchInput,
    selectedOperandInDropdown,
    setObjectFilterDropdownSelectedOptionValues,
    objectFilterDropdownSelectedOptionValues,
    selectFilter,
  } = useFilterDropdown();

  const fieldMetaDataId = filterDefinitionUsedInDropdown?.fieldMetadataId ?? '';

  const { filteredSelectedOptions, optionsToSelect, selectedOptions } =
    useOptionsForSelect({
      searchFilterText: objectFilterDropdownSearchInput,
      selectedValues: objectFilterDropdownSelectedOptionValues,
      fieldMetaDataId,
      limit: 10,
    });

  const handleMultipleOptionSelectChange = (
    optionToSelect: SelectableOption,
    newSelectedValue: boolean,
  ) => {
    const newSelectedOptionValues = newSelectedValue
      ? [...objectFilterDropdownSelectedOptionValues, optionToSelect.value]
      : objectFilterDropdownSelectedOptionValues.filter(
          (value) => value !== optionToSelect.value,
        );

    setObjectFilterDropdownSelectedOptionValues(newSelectedOptionValues);

    const selectedOptionLabels = [
      ...optionsToSelect,
      ...selectedOptions,
      ...filteredSelectedOptions,
    ]
      .filter(
        (option, index, self) =>
          self.findIndex((r) => r.id === option.id) === index,
      )
      .filter((option) => newSelectedOptionValues.includes(option.value))
      .map((option) => option.label);

    const filterDisplayValue =
      selectedOptionLabels.length > MAX_OPTIONS_TO_DISPLAY
        ? `${selectedOptionLabels.length} options`
        : selectedOptionLabels.join(', ');

    if (filterDefinitionUsedInDropdown && selectedOperandInDropdown) {
      const newFilterValue =
        newSelectedOptionValues.length > 0
          ? JSON.stringify(newSelectedOptionValues)
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

  return (
    <MultipleOptionSelectDropdown
      optionsToSelect={optionsToSelect}
      filteredSelectedOptions={filteredSelectedOptions}
      onChange={handleMultipleOptionSelectChange}
      searchFilter={objectFilterDropdownSearchInput}
    />
  );
};
