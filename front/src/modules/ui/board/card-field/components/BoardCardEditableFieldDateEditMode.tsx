import { DateInputEdit } from '@/ui/input/date/components/DateInputEdit';

type OwnProps = {
  value: Date;
  onChange: (newValue: Date) => void;
};

export function BoardCardEditableFieldDateEditMode({
  value,
  onChange,
}: OwnProps) {
  function handleDateChange(newDate: Date) {
    onChange(newDate);
  }

  return <DateInputEdit value={value} onChange={handleDateChange} />;
}
