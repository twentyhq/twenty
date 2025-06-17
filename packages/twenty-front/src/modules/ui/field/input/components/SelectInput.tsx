import { SelectInput as SelectBaseInput } from '@/ui/input/components/SelectInput';
import { DropdownHotkeyScope } from '@/ui/layout/dropdown/constants/DropdownHotkeyScope';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectOption } from 'twenty-ui/input';

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
}: SelectInputProps) => {
  return (
    <SelectableList
      selectableListInstanceId={selectableListComponentInstanceId}
      selectableItemIdArray={selectableItemIdArray}
      focusId={focusId}
      hotkeyScope={DropdownHotkeyScope.Dropdown}
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
      />
    </SelectableList>
  );
};
