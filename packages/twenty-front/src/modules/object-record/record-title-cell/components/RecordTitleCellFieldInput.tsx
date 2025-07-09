import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { RecordTitleCellTextFieldInput } from '@/object-record/record-title-cell/components/RecordTitleCellTextFieldInput';
import { RecordTitleFullNameFieldInput } from '@/object-record/record-title-cell/components/RecordTitleFullNameFieldInput';

type RecordTitleCellFieldInputProps = {
  instanceId: string;
  onClickOutside?: (
    persist: () => void,
    event: MouseEvent | TouchEvent,
  ) => void;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
  sizeVariant?: 'xs' | 'md';
};

export const RecordTitleCellFieldInput = ({
  instanceId,
  sizeVariant,
  onEnter,
  onEscape,
  onShiftTab,
  onTab,
  onClickOutside,
}: RecordTitleCellFieldInputProps) => {
  const { fieldDefinition } = useContext(FieldContext);

  if (!isFieldText(fieldDefinition) && !isFieldFullName(fieldDefinition)) {
    throw new Error('Field definition is not a text or full name field');
  }

  return (
    <>
      {isFieldText(fieldDefinition) ? (
        <RecordTitleCellTextFieldInput
          instanceId={instanceId}
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
          sizeVariant={sizeVariant}
        />
      ) : isFieldFullName(fieldDefinition) ? (
        <RecordTitleFullNameFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
          sizeVariant={sizeVariant}
        />
      ) : null}
    </>
  );
};
