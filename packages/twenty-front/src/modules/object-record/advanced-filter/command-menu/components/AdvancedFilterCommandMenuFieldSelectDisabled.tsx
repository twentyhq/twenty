import { useRecordFilterField } from '@/object-record/advanced-filter/hooks/useRecordFilterField';
import { SelectControl } from '@/ui/input/components/SelectControl';

type AdvancedFilterCommandMenuFieldSelectDisabledProps = {
  recordFilterId: string;
};

export const AdvancedFilterCommandMenuFieldSelectDisabled = ({
  recordFilterId,
}: AdvancedFilterCommandMenuFieldSelectDisabledProps) => {
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
