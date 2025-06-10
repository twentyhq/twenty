import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';

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
    <TextInputV2
      value={recordFilter.value}
      onChange={handleChange}
      placeholder="Enter value"
      fullWidth
    />
  );
};
