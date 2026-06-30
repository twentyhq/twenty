import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { TextInput } from '@/ui/input/components/TextInput';
import { t } from '@lingui/core/macro';

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
      placeholder={t`Enter value`}
      fullWidth
    />
  );
};
