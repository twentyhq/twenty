import { InplaceInputDate } from '@/ui/inplace-input/components/InplaceInputDate';

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

  return <InplaceInputDate value={value} onChange={handleDateChange} />;
}
