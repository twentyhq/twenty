import { useRecordFilterField } from '@/object-record/advanced-filter/hooks/useRecordFilterField';
import { SelectControl } from 'twenty-ui/input';

type WorkflowAdvancedFilterFieldSelectDisabledProps = {
  recordFilterId: string;
};

export const WorkflowAdvancedFilterFieldSelectDisabled = ({
  recordFilterId,
}: WorkflowAdvancedFilterFieldSelectDisabledProps) => {
  const { label, icon } = useRecordFilterField(recordFilterId);

  return (
    <SelectControl
      selectedOption={{
        label,
        value: null,
        Icon: icon,
      }}
      isDisabled
    />
  );
};
