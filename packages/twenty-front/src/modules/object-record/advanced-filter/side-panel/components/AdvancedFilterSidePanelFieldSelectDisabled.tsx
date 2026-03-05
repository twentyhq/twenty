import { useRecordFilterField } from '@/object-record/advanced-filter/hooks/useRecordFilterField';
import { SelectControl } from '@/ui/input/components/SelectControl';

type AdvancedFilterSidePanelFieldSelectDisabledProps = {
  recordFilterId: string;
};

export const AdvancedFilterSidePanelFieldSelectDisabled = ({
  recordFilterId,
}: AdvancedFilterSidePanelFieldSelectDisabledProps) => {
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
