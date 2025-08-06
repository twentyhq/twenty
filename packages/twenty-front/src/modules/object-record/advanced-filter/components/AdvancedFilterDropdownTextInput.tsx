import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { TextInput } from '@/ui/input/components/TextInput';

type AdvancedFilterDropdownTextInputProps = {
  recordFilter: RecordFilter;
};

export const AdvancedFilterDropdownTextInput = ({
  recordFilter,
}: AdvancedFilterDropdownTextInputProps) => {
  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const handleChange = (newValue: string) => {
    applyObjectFilterDropdownFilterValue(newValue);
  };

  return (
    <TextInput
      value={recordFilter.value}
      onChange={handleChange}
      placeholder="Enter value"
      fullWidth
    />
  );
};
