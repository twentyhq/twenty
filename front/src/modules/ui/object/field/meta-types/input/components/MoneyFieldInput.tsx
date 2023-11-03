import { TextInput } from '@/ui/object/field/meta-types/input/components/internal/TextInput';

import { useMoneyField } from '../../hooks/useMoneyField';

import { FieldInputOverlay } from './internal/FieldInputOverlay';

export type FieldInputEvent = (persist: () => void) => void;

export type MoneyFieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const MoneyFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: MoneyFieldInputProps) => {
  const { fieldDefinition, hotkeyScope, persistMoneyField, initialValue } =
    useMoneyField();

  const handleEnter = (newText: string) => {
    onEnter?.(() => persistMoneyField(newText));
  };

  const handleEscape = (newText: string) => {
    onEscape?.(() => persistMoneyField(newText));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    onClickOutside?.(() => persistMoneyField(newText));
  };

  const handleTab = (newText: string) => {
    onTab?.(() => persistMoneyField(newText));
  };

  const handleShiftTab = (newText: string) => {
    onShiftTab?.(() => persistMoneyField(newText));
  };

  return (
    <FieldInputOverlay>
      <TextInput
        placeholder={fieldDefinition.metadata.placeHolder}
        autoFocus
        value={initialValue?.toLocaleString() ?? ''}
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
