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

  const handlePersistField = (newText: string) => {
    if (!newText || isValidJSON(newText)) persistField(newText || null);
  };

  const handleEnter = (newText: string) => {
    onEnter?.(() => handlePersistField(newText));
  };

  const handleEscape = (newText: string) => {
    onEscape?.(() => handlePersistField(newText));
  };

  const handleClickOutside = (
    _event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    onClickOutside?.(() => handlePersistField(newText));
  };

  const handleTab = (newText: string) => {
    onTab?.(() => handlePersistField(newText));
  };

  const handleShiftTab = (newText: string) => {
    onShiftTab?.(() => handlePersistField(newText));
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
        maxRows={25}
      />
    </FieldTextAreaOverlay>
  );
};
