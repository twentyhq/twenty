import { FieldTextAreaOverlay } from '@/ui/field/input/components/FieldTextAreaOverlay';
import { TextAreaInput } from '@/ui/field/input/components/TextAreaInput';

import { useJsonField } from '../../hooks/useJsonField';

import { FieldInputEvent } from './DateTimeFieldInput';

type RawJsonFieldInputProps = {
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
  const {
    fieldDefinition,
    draftValue,
    hotkeyScope,
    setDraftValue,
    persistJsonField,
  } = useJsonField();

  const handleEnter = (newText: string) => {
    onEnter?.(() => persistJsonField(newText));
  };

  const handleEscape = (newText: string) => {
    onEscape?.(() => persistJsonField(newText));
  };

  const handleClickOutside = (
    _event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    onClickOutside?.(() => persistJsonField(newText));
  };

  const handleTab = (newText: string) => {
    onTab?.(() => persistJsonField(newText));
  };

  const handleShiftTab = (newText: string) => {
    onShiftTab?.(() => persistJsonField(newText));
  };

  const handleChange = (newText: string) => {
    setDraftValue(newText);
  };

  return (
    <FieldTextAreaOverlay>
      <TextAreaInput
        placeholder={fieldDefinition.metadata.placeHolder}
        autoFocus
        value={draftValue ?? ''}
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
