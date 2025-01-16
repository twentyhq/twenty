import { Nullable } from 'twenty-ui';

import { useDateField } from '@/object-record/record-field/meta-types/hooks/useDateField';
import { DateInput } from '@/ui/field/input/components/DateInput';
import { isDefined } from '~/utils/isDefined';

import { FieldInputClickOutsideEvent } from '@/object-record/record-field/meta-types/input/components/DateTimeFieldInput';
import { usePersistField } from '../../../hooks/usePersistField';

type FieldInputEvent = (persist: () => void) => void;

type DateFieldInputProps = {
  onClickOutside?: FieldInputClickOutsideEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onClear?: FieldInputEvent;
  onSubmit?: FieldInputEvent;
};

export const DateFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onClear,
  onSubmit,
}: DateFieldInputProps) => {
  const { fieldValue, setDraftValue, hotkeyScope } = useDateField();

  const persistField = usePersistField();

  const persistDate = (newDate: Nullable<Date>) => {
    if (!isDefined(newDate)) {
      persistField(null);
    } else {
      const newDateWithoutTime = `${newDate?.getFullYear()}-${(
        newDate?.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}-${newDate?.getDate().toString().padStart(2, '0')}`;

      persistField(newDateWithoutTime);
    }
  };

  const handleEnter = (newDate: Nullable<Date>) => {
    onEnter?.(() => persistDate(newDate));
  };

  const handleSubmit = (newDate: Nullable<Date>) => {
    onSubmit?.(() => persistDate(newDate));
  };

  const handleEscape = (newDate: Nullable<Date>) => {
    onEscape?.(() => persistDate(newDate));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newDate: Nullable<Date>,
  ) => {
    onClickOutside?.(() => persistDate(newDate), event);
  };

  const handleChange = (newDate: Nullable<Date>) => {
    setDraftValue(newDate?.toDateString() ?? '');
  };

  const handleClear = () => {
    onClear?.(() => persistDate(null));
  };

  const dateValue = fieldValue ? new Date(fieldValue) : null;

  return (
    <DateInput
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      value={dateValue}
      clearable
      onChange={handleChange}
      onClear={handleClear}
      onSubmit={handleSubmit}
      hotkeyScope={hotkeyScope}
    />
  );
};
