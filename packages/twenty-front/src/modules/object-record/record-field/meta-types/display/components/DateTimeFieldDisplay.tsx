import { useDateTimeFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useDateTimeFieldDisplay';
import { DateTimeDisplay } from '@/ui/field/display/components/DateTimeDisplay';

export const DateTimeFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useDateTimeFieldDisplay();

  const displayFormat =
    fieldDefinition.metadata?.settings?.displayFormat;

  return (
    <DateTimeDisplay
      value={fieldValue}
      displayFormat={displayFormat}
    />
  );
};
