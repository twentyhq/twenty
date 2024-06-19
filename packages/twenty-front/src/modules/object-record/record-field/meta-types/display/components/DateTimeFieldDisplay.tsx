import { useDateTimeFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useDateTimeFieldDisplay';
import { DateTimeDisplay } from '@/ui/field/display/components/DateTimeDisplay';

export const DateTimeFieldDisplay = () => {
  const { fieldValue, timeZone, dateFormat, timeFormat } =
    useDateTimeFieldDisplay();

  return (
    <DateTimeDisplay
      value={fieldValue}
      timeZone={timeZone}
      dateFormat={dateFormat}
      timeFormat={timeFormat}
    />
  );
};
