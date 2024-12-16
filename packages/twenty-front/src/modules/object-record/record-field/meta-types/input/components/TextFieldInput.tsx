import { TextAreaInput } from '@/ui/field/input/components/TextAreaInput';

import { usePersistField } from '../../../hooks/usePersistField';
import { useTextField } from '../../hooks/useTextField';

import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import { turnIntoUndefinedIfWhitespacesOnly } from '~/utils/string/turnIntoUndefinedIfWhitespacesOnly';
import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from './DateTimeFieldInput';

export type TextFieldInputProps = {
  onClickOutside?: FieldInputClickOutsideEvent;
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
    onEnter?.(() => persistField(newText.trim()));
  };

  const handleEscape = (newText: string) => {
    onEscape?.(() => persistField(newText.trim()));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    onClickOutside?.(() => persistField(newText.trim()), event);
  };

  const handleTab = (newText: string) => {
    onTab?.(() => persistField(newText.trim()));
  };

  const handleShiftTab = (newText: string) => {
    onShiftTab?.(() => persistField(newText.trim()));
  };

  const handleChange = (newText: string) => {
    setDraftValue(turnIntoUndefinedIfWhitespacesOnly(newText));
  };

  return (
    <FieldInputContainer>
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
    </FieldInputContainer>
  );
};
