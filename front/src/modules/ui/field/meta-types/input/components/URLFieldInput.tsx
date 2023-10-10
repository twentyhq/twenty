import { TextInput } from '@/ui/input/components/TextInput';

import { useURLField } from '../../hooks/useURLField';

import { FieldInputEvent } from './DateFieldInput';

type URLFieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const URLFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: URLFieldInputProps) => {
  const { fieldDefinition, fieldValue, hotkeyScope, persistURLField } =
    useURLField();

  const handleEnter = (newText: string) => {
    onEnter?.(() => persistURLField(newText));
  };

  const handleEscape = (newText: string) => {
    onEscape?.(() => persistURLField(newText));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    onClickOutside?.(() => persistURLField(newText));
  };

  const handleTab = (newText: string) => {
    onTab?.(() => persistURLField(newText));
  };

  const handleShiftTab = (newText: string) => {
    onShiftTab?.(() => persistURLField(newText));
  };

  return (
    <TextInput
      placeholder={fieldDefinition.metadata.placeHolder}
      autoFocus
      value={fieldValue ?? ''}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      onShiftTab={handleShiftTab}
      onTab={handleTab}
      hotkeyScope={hotkeyScope}
    />
  );
};
