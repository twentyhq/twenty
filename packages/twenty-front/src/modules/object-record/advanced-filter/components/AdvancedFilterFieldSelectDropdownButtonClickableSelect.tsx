import { useRecordFilterField } from '@/object-record/advanced-filter/hooks/useRecordFilterField';
import { SelectControl } from 'twenty-ui/input';

type AdvancedFilterFieldSelectDropdownButtonClickableSelectProps = {
  recordFilterId: string;
};

export const AdvancedFilterFieldSelectDropdownButtonClickableSelect = ({
  recordFilterId,
}: AdvancedFilterFieldSelectDropdownButtonClickableSelectProps) => {
  const { label, icon } = useRecordFilterField(recordFilterId);

  return (
    <SelectControl
      selectedOption={{
        label,
        value: null,
        Icon: icon,
      }}
    />
  );
};
