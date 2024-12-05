import { Nullable } from 'twenty-ui';

import { DateInput } from '@/ui/field/input/components/DateInput';

import { useRef, useState } from 'react';
import { usePersistField } from '../../../hooks/usePersistField';
import { useDateTimeField } from '../../hooks/useDateTimeField';

export type FieldInputEvent = (persist: () => void) => void;
export type FieldInputClickOutsideEvent = (
  persist: () => void,
  event: MouseEvent | TouchEvent,
) => void;

export type DateTimeFieldInputProps = {
  onClickOutside?: FieldInputClickOutsideEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onClear?: FieldInputEvent;
  onSubmit?: FieldInputEvent;
};

export const DateTimeFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onClear,
  onSubmit,
}: DateTimeFieldInputProps) => {
  const { fieldValue, setDraftValue } = useDateTimeField();

  const persistField = usePersistField();

  const persistDate = (newDate: Nullable<Date>) => {
    if (!newDate) {
      persistField(null);
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

  const handleSubmit = (newDate: Nullable<Date>) => {
    onSubmit?.(() => persistDate(newDate));
  };

  const dateValue = fieldValue ? new Date(fieldValue) : null;

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [temporaryValue, setTemporaryValue] =
    useState<Nullable<Date>>(dateValue);

  return (
    <div ref={wrapperRef}>
      <DateInput
        onClickOutside={handleClickOutside}
        onEnter={handleEnter}
        onEscape={handleEscape}
        clearable
        onChange={handleChange}
        isDateTimeInput
        onClear={handleClear}
        onSubmit={handleSubmit}
        wrapperRef={wrapperRef}
        temporaryValue={temporaryValue}
        setTemporaryValue={setTemporaryValue}
      />
    </div>
  );
};
