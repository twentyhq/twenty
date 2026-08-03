import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { useComputeRecordRelationFilterDisplayValue } from '@/views/hooks/useComputeRecordRelationFilterDisplayValue';

type AdvancedFilterRelationValueInputClickableSelectProps = {
  recordFilter: RecordFilter;
  isDisabled: boolean;
};

export const AdvancedFilterRelationValueInputClickableSelect = ({
  recordFilter,
  isDisabled,
}: AdvancedFilterRelationValueInputClickableSelectProps) => {
  const { displayValue } = useComputeRecordRelationFilterDisplayValue({
    recordFilter,
  });

  return (
    <SelectControl
      selectedOption={{
        label: displayValue,
        value: null,
        disabled: isDisabled,
      }}
      textAccent="default"
      isDisabled={false}
    />
  );
};
