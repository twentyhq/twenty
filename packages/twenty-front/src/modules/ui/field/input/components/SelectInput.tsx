import { DEFAULT_CELL_SCOPE } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { SelectInput as SelectBaseInput } from '@/ui/input/components/SelectInput';
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
      hotkeyScope={DEFAULT_CELL_SCOPE.scope}
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
