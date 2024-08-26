import { FieldTextAreaOverlay } from '@/ui/field/input/components/FieldTextAreaOverlay';
import { TextAreaInput } from '@/ui/field/input/components/TextAreaInput';

import { usePersistField } from '../../../hooks/usePersistField';
import { useTextField } from '../../hooks/useTextField';

import { FieldInputEvent } from './DateTimeFieldInput';

export type TextFieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const TextFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: TextFieldInputProps) => {
  const { fieldDefinition, draftValue, hotkeyScope, setDraftValue } =
    useTextField();

  const persistField = usePersistField();

  const handleEnter = (newText: string) => {
    onEnter?.(() => persistField(newText));
  };

  const handleEscape = (newText: string) => {
    onEscape?.(() => persistField(newText));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    onClickOutside?.(() => persistField(newText));
  };

  const handleTab = (newText: string) => {
    onTab?.(() => persistField(newText));
  };

  const handleShiftTab = (newText: string) => {
    onShiftTab?.(() => persistField(newText));
  };

  const handleChange = (newText: string) => {
    // draft value when string getting "" isn't resettings to undefined -> need to have a look on how this can be generalised and when to put.
    if (newText.trim() === '') {
      setDraftValue(undefined);
    } else {
      setDraftValue(newText);
    }
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
      />
    </FieldTextAreaOverlay>
  );
};
