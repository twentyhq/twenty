import { DateInputEdit } from '@/ui/input/date/components/DateInputEdit';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { parseDate } from '~/utils/date-utils';

import { useEditableField } from '../../hooks/useEditableField';

type OwnProps = {
  value: string;
  onChange?: (newValue: string) => void;
  parentHotkeyScope?: HotkeyScope;
};

export function EditableFieldEditModeDate({ value, onChange }: OwnProps) {
  const { closeEditableField } = useEditableField();

  function handleChange(newValue: string) {
    onChange?.(newValue);
    closeEditableField();
  }

  return (
    <DateInputEdit
      value={parseDate(value).toJSDate()}
      onChange={(newDate: Date) => {
        handleChange(newDate.toISOString());
      }}
    />
  );
}
