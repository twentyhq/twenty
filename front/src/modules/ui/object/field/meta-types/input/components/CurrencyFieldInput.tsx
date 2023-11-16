import { TextInput } from '@/ui/object/field/meta-types/input/components/internal/TextInput';
import { convertCurrencyToCurrencyMicros } from '~/utils/convert-currency-amount';

import { useCurrencyField } from '../../hooks/useCurrencyField';

import { FieldInputOverlay } from './internal/FieldInputOverlay';
import { FieldInputEvent } from './DateFieldInput';

export type CurrencyFieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const CurrencyFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: CurrencyFieldInputProps) => {
  const { hotkeyScope, initialValue, persistCurrencyField } =
    useCurrencyField();

  const handleEnter = (newValue: string) => {
    onEnter?.(() =>
      persistCurrencyField({
        amountMicros:
          convertCurrencyToCurrencyMicros(parseFloat(newValue)) ?? 0,
        currencyCode: initialValue.currencyCode,
      }),
    );
  };

  const handleEscape = (newValue: string) => {
    onEscape?.(() =>
      persistCurrencyField({
        amountMicros:
          convertCurrencyToCurrencyMicros(parseFloat(newValue)) ?? 0,
        currencyCode: initialValue.currencyCode,
      }),
    );
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newValue: string,
  ) => {
    onClickOutside?.(() =>
      persistCurrencyField({
        amountMicros:
          convertCurrencyToCurrencyMicros(parseFloat(newValue)) ?? 0,
        currencyCode: initialValue.currencyCode,
      }),
    );
  };

  const handleTab = (newValue: string) => {
    onTab?.(() =>
      persistCurrencyField({
        amountMicros:
          convertCurrencyToCurrencyMicros(parseFloat(newValue)) ?? 0,
        currencyCode: initialValue.currencyCode,
      }),
    );
  };

  const handleShiftTab = (newValue: string) => {
    onShiftTab?.(() =>
      persistCurrencyField({
        amountMicros:
          convertCurrencyToCurrencyMicros(parseFloat(newValue)) ?? 0,
        currencyCode: initialValue.currencyCode,
      }),
    );
  };

  return (
    <FieldInputOverlay>
      <TextInput
        value={initialValue.amountMicros?.toString() ?? ''}
        placeholder="Currency"
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
