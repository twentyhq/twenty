import { TextInput } from '@/ui/input/components/TextInput';

import { useNumberField } from '../../hooks/useNumberField';

export type FieldInputEvent = (persist: () => void) => void;

type OwnProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const NumberFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: OwnProps) => {
  const { fieldDefinition, fieldValue, hotkeyScope, persistNumberField } =
    useNumberField();

  const handleEnter = (newText: string) => {
    onEnter?.(() => persistNumberField(newText));
  };

  const handleEscape = (newText: string) => {
    onEscape?.(() => persistNumberField(newText));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    onClickOutside?.(() => persistNumberField(newText));
  };

  const handleTab = (newText: string) => {
    onTab?.(() => persistNumberField(newText));
  };

  const handleShiftTab = (newText: string) => {
    onShiftTab?.(() => persistNumberField(newText));
  };

  return (
    <TextInput
      placeholder={fieldDefinition.metadata.placeHolder}
      autoFocus
      value={fieldValue?.toLocaleString() ?? ''}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      onShiftTab={handleShiftTab}
      onTab={handleTab}
      hotkeyScope={hotkeyScope}
    />
  );
};
