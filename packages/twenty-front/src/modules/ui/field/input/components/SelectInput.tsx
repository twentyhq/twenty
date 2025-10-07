import { SelectInput as SelectBaseInput } from '@/ui/input/components/SelectInput';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { type SelectOption } from 'twenty-ui/input';

type SelectInputProps = {
  selectableListComponentInstanceId: string;
  selectableItemIdArray: string[];
  focusId: string;
  onEnter: (itemId: string) => void;
  onOptionSelected: (selectedOption: SelectOption) => void;
  options: SelectOption[];
  onCancel?: () => void;
  defaultOption?: SelectOption | undefined;
  onFilterChange?: ((filteredOptions: SelectOption[]) => void) | undefined;
  onClear?: (() => void) | undefined;
  clearLabel?: string;
  onAddSelectOption?: (optionName: string) => void;
};

export const SelectInput = ({
  selectableListComponentInstanceId,
  selectableItemIdArray,
  focusId,
  onOptionSelected,
  options,
  onCancel,
  defaultOption,
  onFilterChange,
  onClear,
  clearLabel,
  onAddSelectOption,
}: SelectInputProps) => {
  return (
    <SelectableList
      selectableListInstanceId={selectableListComponentInstanceId}
      selectableItemIdArray={selectableItemIdArray}
      focusId={focusId}
    >
      <SelectBaseInput
        onOptionSelected={onOptionSelected}
        options={options}
        onCancel={onCancel}
        defaultOption={defaultOption}
        onFilterChange={onFilterChange}
        onClear={onClear}
        clearLabel={clearLabel}
        focusId={focusId}
        onAddSelectOption={onAddSelectOption}
      />
    </SelectableList>
  );
};
