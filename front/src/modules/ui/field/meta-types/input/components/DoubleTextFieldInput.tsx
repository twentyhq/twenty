import { DoubleTextInput } from '@/ui/field/meta-types/input/components/internal/DoubleTextInput';
import { FieldDoubleText } from '@/ui/field/types/FieldDoubleText';

import { usePersistField } from '../../../hooks/usePersistField';
import { useDoubleTextField } from '../../hooks/useDoubleTextField';

import { FieldInputEvent } from './DateFieldInput';

type DoubleTextFieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const DoubleTextFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: DoubleTextFieldInputProps) => {
  const { fieldDefinition, firstValue, secondValue, hotkeyScope } =
    useDoubleTextField();

  const persistField = usePersistField();

  const handleEnter = (newDoubleText: FieldDoubleText) => {
    onEnter?.(() => persistField(newDoubleText));
  };

  const handleEscape = (newDoubleText: FieldDoubleText) => {
    onEscape?.(() => persistField(newDoubleText));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newDoubleText: FieldDoubleText,
  ) => {
    onClickOutside?.(() => persistField(newDoubleText));
  };

  const handleTab = (newDoubleText: FieldDoubleText) => {
    onTab?.(() => persistField(newDoubleText));
  };

  const handleShiftTab = (newDoubleText: FieldDoubleText) => {
    onShiftTab?.(() => persistField(newDoubleText));
  };

  return (
    <DoubleTextInput
      firstValue={firstValue ?? ''}
      secondValue={secondValue ?? ''}
      firstValuePlaceholder={fieldDefinition.metadata.firstValuePlaceholder}
      secondValuePlaceholder={fieldDefinition.metadata.secondValuePlaceholder}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      onShiftTab={handleShiftTab}
      onTab={handleTab}
      hotkeyScope={hotkeyScope}
    />
  );
};
