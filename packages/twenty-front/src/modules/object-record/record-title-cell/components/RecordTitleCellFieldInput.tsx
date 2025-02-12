import { useContext } from 'react';

import { FullNameFieldInput } from '@/object-record/record-field/meta-types/input/components/FullNameFieldInput';
import { RecordFieldInputScope } from '@/object-record/record-field/scopes/RecordFieldInputScope';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { RecordTitleCellTextInput } from '@/object-record/record-title-cell/components/RecordTitleCellTextInput';

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
};

export const RecordTitleCellFieldInput = ({
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
        <RecordTitleCellTextInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : isFieldFullName(fieldDefinition) ? (
        <FullNameFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      ) : (
        <></>
      )}
    </RecordFieldInputScope>
  );
};
