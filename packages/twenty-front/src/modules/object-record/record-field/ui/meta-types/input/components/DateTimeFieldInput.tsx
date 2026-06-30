import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { DateTimeInput } from '@/ui/field/input/components/DateTimeInput';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { Temporal } from 'temporal-polyfill';
import { type Nullable } from 'twenty-ui/utilities';
import { useDateTimeField } from '@/object-record/record-field/ui/meta-types/hooks/useDateTimeField';

export const DateTimeFieldInput = () => {
  const { fieldValue, setDraftValue } = useDateTimeField();

  const { onEnter, onEscape, onClickOutside, onSubmit } = useContext(
    FieldInputEventContext,
  );

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const getDateToPersist = (newInstant: Nullable<Temporal.Instant>) => {
    if (!newInstant) {
      return null;
    } else {
      const newDateISO = newInstant?.toString();

      return newDateISO;
    }
  };

  const handleEnter = (newDate: Nullable<Temporal.Instant>) => {
    onEnter?.({ newValue: getDateToPersist(newDate) });
  };

  const handleEscape = (newDate: Nullable<Temporal.Instant>) => {
    onEscape?.({ newValue: getDateToPersist(newDate) });
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newDate: Nullable<Temporal.Instant>,
  ) => {
    onClickOutside?.({ newValue: getDateToPersist(newDate), event });
  };

  const handleChange = (newInstant: Nullable<Temporal.Instant>) => {
    setDraftValue(newInstant?.toString() ?? '');
  };

  const handleClear = () => {
    onSubmit?.({ newValue: null });
  };

  const handleSubmit = (newInstant: Nullable<Temporal.Instant>) => {
    onSubmit?.({ newValue: getDateToPersist(newInstant) });
  };

  const dateValue = isNonEmptyString(fieldValue)
    ? Temporal.Instant.from(fieldValue)
    : null;

  return (
    <DateTimeInput
      instanceId={instanceId}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      value={dateValue}
      clearable
      onChange={handleChange}
      onClear={handleClear}
      onSubmit={handleSubmit}
    />
  );
};
