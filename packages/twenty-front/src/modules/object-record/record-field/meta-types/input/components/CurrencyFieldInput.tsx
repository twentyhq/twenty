import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { CurrencyInput } from '@/ui/field/input/components/CurrencyInput';

import { FieldInputOverlay } from '../../../../../ui/field/input/components/FieldInputOverlay';
import { useCurrencyField } from '../../hooks/useCurrencyField';

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
  const { hotkeyScope, draftValue, persistCurrencyField, setDraftValue } =
    useCurrencyField();

  const handleEnter = (newValue: string) => {
    onEnter?.(() => {
      persistCurrencyField({
        amountText: newValue,
        currencyCode: draftValue?.currencyCode ?? CurrencyCode.USD,
      });
    });
  };

  const handleEscape = (newValue: string) => {
    onEscape?.(() => {
      persistCurrencyField({
        amountText: newValue,
        currencyCode: draftValue?.currencyCode ?? CurrencyCode.USD,
      });
    });
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newValue: string,
  ) => {
    onClickOutside?.(() => {
      persistCurrencyField({
        amountText: newValue,
        currencyCode: draftValue?.currencyCode ?? CurrencyCode.USD,
      });
    });
  };

  const handleTab = (newValue: string) => {
    onTab?.(() => {
      persistCurrencyField({
        amountText: newValue,
        currencyCode: draftValue?.currencyCode ?? CurrencyCode.USD,
      });
    });
  };

  const handleShiftTab = (newValue: string) => {
    onShiftTab?.(() =>
      persistCurrencyField({
        amountText: newValue,
        currencyCode: draftValue?.currencyCode ?? CurrencyCode.USD,
      }),
    );
  };

  const handleChange = (newValue: string) => {
    setDraftValue({
      amount: newValue,
      currencyCode: draftValue?.currencyCode ?? CurrencyCode.USD,
    });
  };

  const handleSelect = (newValue: string) => {
    setDraftValue({
      amount: draftValue?.amount ?? '',
      currencyCode: newValue as CurrencyCode,
    });
  };

  return (
    <FieldInputOverlay>
      <CurrencyInput
        value={draftValue?.amount?.toString() ?? ''}
        currencyCode={draftValue?.currencyCode ?? CurrencyCode.USD}
        autoFocus
        placeholder="Currency"
        onClickOutside={handleClickOutside}
        onEnter={handleEnter}
        onEscape={handleEscape}
        onShiftTab={handleShiftTab}
        onTab={handleTab}
        onChange={handleChange}
        onSelect={handleSelect}
        hotkeyScope={hotkeyScope}
      />
    </FieldInputOverlay>
  );
};
