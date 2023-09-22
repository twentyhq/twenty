import { DateInput } from '@/ui/input/components/DateInput';
import { Nullable } from '~/types/Nullable';

import { useDateField } from '../../hooks/useDateField';
import { usePersistField } from '../../hooks/usePersistField';

export type FieldInputEvent = (persist: () => void) => void;

type OwnProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const DateFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
}: OwnProps) => {
  const { fieldValue, hotkeyScope } = useDateField();

  const persistField = usePersistField();

  const persistDate = (newDate: Nullable<Date>) => {
    if (!newDate) {
      persistField('');
    } else {
      const newDateISO = newDate?.toISOString();

      persistField(newDateISO);
    }
  };

  const handleEnter = (newDate: Nullable<Date>) => {
    onEnter?.(() => persistDate(newDate));
  };

  const handleEscape = (newDate: Nullable<Date>) => {
    onEscape?.(() => persistDate(newDate));
  };

  const handleClickOutside = (
    _event: MouseEvent | TouchEvent,
    newDate: Nullable<Date>,
  ) => {
    onClickOutside?.(() => persistDate(newDate));
  };

  const dateValue = fieldValue ? new Date(fieldValue) : null;

  return (
    <DateInput
      hotkeyScope={hotkeyScope}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      value={dateValue}
    />
  );
};
