import { SelectOption } from '@/spreadsheet-import/types';
import { SelectInput as SelectBaseInput } from '@/ui/input/components/SelectInput';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';

type SelectInputProps = {
  selectableListId: string;
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
  selectableListId,
  selectableItemIdArray,
  hotkeyScope,
  onEnter,
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
      selectableListId={selectableListId}
      selectableItemIdArray={selectableItemIdArray}
      hotkeyScope={hotkeyScope}
      onEnter={onEnter}
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
