import { HotkeyScope } from '@/lib/hotkeys/types/HotkeyScope';
import { InplaceInputDate } from '@/ui/inplace-inputs/components/InplaceInputDate';
import { parseDate } from '@/utils/datetime/date-utils';

import { useEditableField } from '../../hooks/useEditableField';

type OwnProps = {
  value: string;
  onChange?: (newValue: string) => void;
  parentHotkeyScope?: HotkeyScope;
};

export function EditableFieldEditModeDate({
  value,
  onChange,
  parentHotkeyScope,
}: OwnProps) {
  const { closeEditableField } = useEditableField(parentHotkeyScope);

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
