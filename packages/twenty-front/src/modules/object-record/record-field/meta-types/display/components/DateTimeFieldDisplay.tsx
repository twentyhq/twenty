import { useDateTimeFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useDateTimeFieldDisplay';
import { DateTimeDisplay } from '@/ui/field/display/components/DateTimeDisplay';

export const DateTimeFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useDateTimeFieldDisplay();

  const displayAsRelativeDate =
    fieldDefinition.metadata?.settings?.displayAsRelativeDate;

  return (
    <DateTimeDisplay
      value={fieldValue}
      displayAsRelativeDate={displayAsRelativeDate}
    />
  );
};
