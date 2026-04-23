import { useDateField } from '@/object-record/record-field/ui/meta-types/hooks/useDateField';
import { DateInput } from '@/ui/field/input/components/DateInput';

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useContext } from 'react';
import { type Nullable } from 'twenty-ui/utilities';

export const DateFieldInput = () => {
  const { fieldValue, setDraftValue } = useDateField();

  const { onEnter, onEscape, onClickOutside, onSubmit } = useContext(
    FieldInputEventContext,
  );

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const handleEnter = (newDate: Nullable<string>) => {
    onEnter?.({ newValue: newDate });
  };

  const handleSubmit = (newDate: Nullable<string>) => {
    onSubmit?.({ newValue: newDate });
  };

  const handleEscape = (newDate: Nullable<string>) => {
    onEscape?.({ newValue: newDate });
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newDate: Nullable<string>,
  ) => {
    onClickOutside?.({ newValue: newDate, event });
  };

  const handleChange = (newDate: Nullable<string>) => {
    setDraftValue(newDate ?? '');
  };

  const handleClear = () => {
    onSubmit?.({ newValue: null });
  };

  const dateValue = fieldValue ?? null;

  return (
    <DateInput
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
