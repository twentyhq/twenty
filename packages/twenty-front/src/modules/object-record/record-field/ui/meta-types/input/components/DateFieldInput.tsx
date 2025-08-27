import { useDateField } from '@/object-record/record-field/ui/meta-types/hooks/useDateField';
import { DateInput } from '@/ui/field/input/components/DateInput';

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type Nullable } from 'twenty-ui/utilities';

export const DateFieldInput = () => {
  const { fieldValue, setDraftValue } = useDateField();

  const { onEnter, onEscape, onClickOutside, onSubmit } = useContext(
    FieldInputEventContext,
  );

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const getDateToPersist = (newDate: Nullable<Date>) => {
    if (!isDefined(newDate)) {
      return null;
    } else {
      const newDateWithoutTime = `${newDate?.getFullYear()}-${(
        newDate?.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}-${newDate?.getDate().toString().padStart(2, '0')}`;

      return newDateWithoutTime;
    }
  };

  const handleEnter = (newDate: Nullable<Date>) => {
    onEnter?.({ newValue: getDateToPersist(newDate) });
  };

  const handleSubmit = (newDate: Nullable<Date>) => {
    onSubmit?.({ newValue: getDateToPersist(newDate) });
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
      onClear={handleClear}
      onSubmit={handleSubmit}
    />
  );
};
