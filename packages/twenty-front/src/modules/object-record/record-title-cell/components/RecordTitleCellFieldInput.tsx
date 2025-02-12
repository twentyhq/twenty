import { useContext } from 'react';

import { RecordFieldInputScope } from '@/object-record/record-field/scopes/RecordFieldInputScope';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { RecordTitleCellTextFieldInput } from '@/object-record/record-title-cell/components/RecordTitleCellTextFieldInput';
import { RecordTitleFullNameFieldInput } from '@/object-record/record-title-cell/components/RecordTitleFullNameFieldInput';

type RecordTitleCellFieldInputProps = {
  recordFieldInputdId: string;
  onSubmit?: FieldInputEvent;
  onCancel?: () => void;
  onClickOutside?: (
    persist: () => void,
    event: MouseEvent | TouchEvent,
  ) => void;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
  isReadOnly?: boolean;
  sizeVariant?: 'sm' | 'md';
};

export const RecordTitleCellFieldInput = ({
  sizeVariant,
  recordFieldInputdId,
  onEnter,
  onEscape,
  onShiftTab,
  onTab,
  onClickOutside,
}: RecordTitleCellFieldInputProps) => {
  const { fieldDefinition } = useContext(FieldContext);

  return (
    <RecordFieldInputScope
      recordFieldInputScopeId={getScopeIdFromComponentId(recordFieldInputdId)}
    >
      {isFieldText(fieldDefinition) ? (
        <RecordTitleCellTextFieldInput
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
      ) : (
        <></>
      )}
    </RecordFieldInputScope>
  );
};
