import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { DateTimeInput } from '@/ui/field/input/components/DateTimeInput';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useContext } from 'react';
import { type Nullable } from 'twenty-ui/utilities';
import { useDateTimeField } from '../../hooks/useDateTimeField';

export const DateTimeFieldInput = () => {
  const { fieldValue, setDraftValue } = useDateTimeField();

  const { onEnter, onEscape, onClickOutside, onSubmit } = useContext(
    FieldInputEventContext,
  );

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const getDateToPersist = (newDate: Nullable<Date>) => {
    if (!newDate) {
      return null;
    } else {
      const newDateISO = newDate?.toISOString();

      return newDateISO;
    }
  };

  const handleEnter = (newDate: Nullable<Date>) => {
    onEnter?.({ newValue: getDateToPersist(newDate) });
  };

  const handleEscape = (newDate: Nullable<Date>) => {
    onEscape?.({ newValue: getDateToPersist(newDate) });
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newDate: Nullable<Date>,
  ) => {
    onClickOutside?.({ newValue: getDateToPersist(newDate), event });
  };

  const handleChange = (newDate: Nullable<Date>) => {
    setDraftValue(newDate?.toDateString() ?? '');
  };

  const handleClear = () => {
    onSubmit?.({ newValue: null });
  };

  const handleSubmit = (newDate: Nullable<Date>) => {
    onSubmit?.({ newValue: getDateToPersist(newDate) });
  };

  const dateValue = fieldValue ? new Date(fieldValue) : null;

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
