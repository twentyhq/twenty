import { HotkeyScope } from '@/ui/hotkey/types/HotkeyScope';
import { InplaceInputDate } from '@/ui/inplace-input/components/InplaceInputDate';
import { parseDate } from '~/utils/date-utils';

import { useEditableField } from '../hooks/useEditableField';

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
    <InplaceInputDate
      value={parseDate(value).toJSDate()}
      onChange={(newDate: Date) => {
        handleChange(newDate.toISOString());
      }}
    />
  );
}
