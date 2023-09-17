import { useEffect, useState } from 'react';

import { DateInput } from '@/ui/input/components/DateInput';
import { Nullable } from '~/types/Nullable';
import { parseDate } from '~/utils/date-utils';

import { useEditableField } from '../../hooks/useEditableField';

type OwnProps = {
  value: string;
  onChange?: (newValue: string) => void;
  parentHotkeyScope: string;
};

// TODO: refactor this component to use the same logic as the GenericDateField component
export const EditableFieldEditModeDate = ({
  value,
  onChange,
  parentHotkeyScope,
}: OwnProps) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const { closeEditableField } = useEditableField();

  const handleClickOutside = () => {
    closeEditableField();
  };

  const handleEnter = (newValue: Nullable<Date>) => {
    onChange?.(newValue?.toISOString() ?? '');
    closeEditableField();
  };

  const handleEscape = () => {
    closeEditableField();
  };

  return (
    <DateInput
      value={internalValue ? parseDate(internalValue).toJSDate() : new Date()}
      hotkeyScope={parentHotkeyScope}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
    />
  );
};
