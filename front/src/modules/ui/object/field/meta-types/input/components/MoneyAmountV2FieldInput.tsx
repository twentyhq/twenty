import { DoubleTextInput } from '@/ui/object/field/meta-types/input/components/internal/DoubleTextInput';

import { usePersistField } from '../../../hooks/usePersistField';
import { FieldDoubleText } from '../../../types/FieldDoubleText';
import { useMoneyAmountV2Field } from '../../hooks/useMoneyAmountV2Field';

import { FieldInputOverlay } from './internal/FieldInputOverlay';
import { FieldInputEvent } from './DateFieldInput';

export type MoneyAmountV2FieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const MoneyAmountV2FieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: MoneyAmountV2FieldInputProps) => {
  const { hotkeyScope, initialValue } = useMoneyAmountV2Field();

  const persistField = usePersistField();

  const handleEnter = (newDoubleText: FieldDoubleText) => {
    onEnter?.(() =>
      persistField({
        amount: parseFloat(newDoubleText.firstValue),
        currency: newDoubleText.secondValue,
      }),
    );
  };

  const handleEscape = (newDoubleText: FieldDoubleText) => {
    onEscape?.(() =>
      persistField({
        amount: parseFloat(newDoubleText.firstValue),
        currency: newDoubleText.secondValue,
      }),
    );
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newDoubleText: FieldDoubleText,
  ) => {
    onClickOutside?.(() =>
      persistField({
        amount: parseFloat(newDoubleText.firstValue),
        currency: newDoubleText.secondValue,
      }),
    );
  };

  const handleTab = (newDoubleText: FieldDoubleText) => {
    onTab?.(() =>
      persistField({
        amount: parseFloat(newDoubleText.firstValue),
        currency: newDoubleText.secondValue,
      }),
    );
  };

  const handleShiftTab = (newDoubleText: FieldDoubleText) => {
    onShiftTab?.(() =>
      persistField({
        amount: parseFloat(newDoubleText.firstValue),
        currency: newDoubleText.secondValue,
      }),
    );
  };

  return (
    <FieldInputOverlay>
      <DoubleTextInput
        firstValue={initialValue.amount?.toString() ?? ''}
        secondValue={initialValue.currency ?? ''}
        firstValuePlaceholder="Amount"
        secondValuePlaceholder="Currency"
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
