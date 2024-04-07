import { isValidJSON } from '@/object-record/record-field/utils/isFieldValueJson';
import { FieldTextAreaOverlay } from '@/ui/field/input/components/FieldTextAreaOverlay';
import { TextAreaInput } from '@/ui/field/input/components/TextAreaInput';

import { usePersistField } from '../../../hooks/usePersistField';
import { useJsonField } from '../../hooks/useJsonField';

import { FieldInputEvent } from './DateFieldInput';

export type RawJsonFieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const RawJsonFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: RawJsonFieldInputProps) => {
  const { fieldDefinition, draftValue, hotkeyScope, setDraftValue } =
    useJsonField();

  const persistField = usePersistField();

  const handleEnter = (newText: string) => {
    onEnter?.(() => {
      if (isValidJSON(newText)) persistField(newText);
    });
  };

  const handleEscape = (newText: string) => {
    onEscape?.(() => {
      if (isValidJSON(newText)) persistField(newText);
    });
  };

  const handleClickOutside = (
    _event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    onClickOutside?.(() => {
      if (isValidJSON(newText)) persistField(newText);
    });
  };

  const handleTab = (newText: string) => {
    onTab?.(() => {
      if (isValidJSON(newText)) persistField(newText);
    });
  };

  const handleShiftTab = (newText: string) => {
    onShiftTab?.(() => {
      if (isValidJSON(newText)) persistField(newText);
    });
  };

  const handleChange = (newText: string) => {
    setDraftValue(newText);
  };

  const value =
    draftValue && isValidJSON(draftValue)
      ? JSON.stringify(JSON.parse(draftValue), null, 2)
      : draftValue ?? '';

  return (
    <FieldTextAreaOverlay>
      <TextAreaInput
        placeholder={fieldDefinition.metadata.placeHolder}
        autoFocus
        value={value}
        onClickOutside={handleClickOutside}
        onEnter={handleEnter}
        onEscape={handleEscape}
        onShiftTab={handleShiftTab}
        onTab={handleTab}
        hotkeyScope={hotkeyScope}
        onChange={handleChange}
      />
    </FieldTextAreaOverlay>
  );
};
