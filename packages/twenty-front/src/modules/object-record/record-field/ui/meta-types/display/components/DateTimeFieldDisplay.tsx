import { useDateTimeFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useDateTimeFieldDisplay';
import { DateTimeDisplay } from '@/ui/field/display/components/DateTimeDisplay';

export const DateTimeFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useDateTimeFieldDisplay();

  const dateFieldSettings = fieldDefinition.metadata?.settings;

  return (
    <DateTimeDisplay value={fieldValue} dateFieldSettings={dateFieldSettings} />
  );
};
