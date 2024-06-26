import { useDateTimeFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useDateTimeFieldDisplay';
import { DateTimeDisplay } from '@/ui/field/display/components/DateTimeDisplay';

export const DateTimeFieldDisplay = () => {
  const { fieldValue } = useDateTimeFieldDisplay();

  return <DateTimeDisplay value={fieldValue} />;
};
