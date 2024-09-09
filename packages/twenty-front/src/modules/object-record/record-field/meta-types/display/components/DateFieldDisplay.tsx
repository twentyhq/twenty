import { useDateFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useDateFieldDisplay';
import { DateDisplay } from '@/ui/field/display/components/DateDisplay';

export const DateFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useDateFieldDisplay();

  const displayAsRelativeDate =
    fieldDefinition.metadata?.settings?.displayAsRelativeDate;

  return (
    <DateDisplay
      value={fieldValue}
      displayAsRelativeDate={displayAsRelativeDate}
    />
  );
};
