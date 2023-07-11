import { InplaceInputDateEditMode } from '@/ui/inplace-inputs/components/InplaceInputDateEditMode';

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

  return <InplaceInputDateEditMode value={value} onChange={handleDateChange} />;
}
