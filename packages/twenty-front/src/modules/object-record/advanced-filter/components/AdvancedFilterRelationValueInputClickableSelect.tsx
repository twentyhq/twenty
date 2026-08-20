import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { useComputeRecordRelationFilterDisplayValue } from '@/views/hooks/useComputeRecordRelationFilterDisplayValue';

type AdvancedFilterRelationValueInputClickableSelectProps = {
  recordFilter: RecordFilter;
};

export const AdvancedFilterRelationValueInputClickableSelect = ({
  recordFilter,
}: AdvancedFilterRelationValueInputClickableSelectProps) => {
  const { displayValue } = useComputeRecordRelationFilterDisplayValue({
    recordFilter,
  });

  return (
    <SelectControl
      selectedOption={{ label: displayValue, value: null }}
      textAccent="default"
      isDisabled={false}
    />
  );
};
