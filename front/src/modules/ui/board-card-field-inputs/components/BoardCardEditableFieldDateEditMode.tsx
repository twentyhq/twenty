import { useBoardCardField } from '@/ui/board-card-field/hooks/useBoardCardField';
import { InplaceInputDateEditMode } from '@/ui/inplace-inputs/components/InplaceInputDateEditMode';

type OwnProps = {
  value: Date;
  onChange: (newValue: Date) => void;
};

export function BoardCardEditableFieldDateEditMode({
  value,
  onChange,
}: OwnProps) {
  const { closeBoardCardField } = useBoardCardField();

  function handleDateChange(newDate: Date) {
    onChange(newDate);
    closeBoardCardField();
  }

  return <InplaceInputDateEditMode value={value} onChange={handleDateChange} />;
}
