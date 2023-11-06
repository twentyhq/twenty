import { TextInput } from '@/ui/object/field/meta-types/input/components/internal/TextInput';

import { useURLField } from '../../hooks/useURLField';

import { FieldInputOverlay } from './internal/FieldInputOverlay';
import { FieldInputEvent } from './DateFieldInput';

export type URLFieldInputProps = {
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
  const { fieldDefinition, initialValue, hotkeyScope, persistURLField } =
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
    <FieldInputOverlay>
      <TextInput
        placeholder={fieldDefinition.metadata.placeHolder}
        autoFocus
        value={initialValue}
        onClickOutside={handleClickOutside}
        onEnter={handleEnter}
        onEscape={handleEscape}
        onShiftTab={handleShiftTab}
        onTab={handleTab}
        hotkeyScope={hotkeyScope}
      />
    </FieldInputOverlay>
  );
};
