import { DateInput } from '@/ui/field/input/components/DateInput';

import { FieldInputEvent } from '@/object-record/record-field/meta-types/input/components/NumberFieldInput';

import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { FieldInputClickOutsideEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { Nullable } from 'twenty-ui/utilities';
import { usePersistField } from '../../../hooks/usePersistField';
import { useDateTimeField } from '../../hooks/useDateTimeField';

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

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

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

  return (
    <DateInput
      instanceId={instanceId}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      value={dateValue}
      clearable
      onChange={handleChange}
      isDateTimeInput
      onClear={handleClear}
      onSubmit={handleSubmit}
    />
  );
};
