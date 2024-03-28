import { useMemo } from 'react';
import { CurrencyInput, CurrencyOption, FieldInputOverlay } from 'twenty-ui';

import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { SETTINGS_FIELD_CURRENCY_CODES } from '@/settings/data-model/constants/SettingsFieldCurrencyCodes';

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

  const currencyOptions = useMemo<CurrencyOption[]>(
    () =>
      Object.entries(SETTINGS_FIELD_CURRENCY_CODES).map(
        ([key, { Icon, label }]) => ({
          value: key,
          Icon,
          label,
        }),
      ),
    [],
  );

  return (
    <FieldInputOverlay>
      <CurrencyInput
        value={draftValue?.amount?.toString() ?? ''}
        currencyCode={draftValue?.currencyCode ?? CurrencyCode.USD}
        currencyOptions={currencyOptions}
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
