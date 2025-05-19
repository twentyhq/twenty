import { SelectInput as SelectBaseInput } from '@/ui/input/components/SelectInput';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectOption } from 'twenty-ui/input';

type SelectInputProps = {
  selectableListComponentInstanceId: string;
  selectableItemIdArray: string[];
  hotkeyScope: string;
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
  hotkeyScope,
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
      hotkeyScope={hotkeyScope}
    >
      <SelectBaseInput
        onOptionSelected={onOptionSelected}
        options={options}
        onCancel={onCancel}
        defaultOption={defaultOption}
        onFilterChange={onFilterChange}
        onClear={onClear}
        clearLabel={clearLabel}
        hotkeyScope={hotkeyScope}
      />
    </SelectableList>
  );
};
