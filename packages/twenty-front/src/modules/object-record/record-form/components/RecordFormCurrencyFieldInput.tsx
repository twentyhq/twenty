import {
  type FieldCurrencyValue,
  type FormFieldCurrencyValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { RecordFormTextInput } from '@/object-record/record-form/components/RecordFormTextInput';
import { CurrencyPickerDropdownButton } from '@/ui/input/components/internal/currency/components/CurrencyPickerDropdownButton';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { CurrencyCode } from 'twenty-shared/constants';
import {
  convertCurrencyAmountToCurrencyMicros,
  convertCurrencyMicrosToCurrencyAmount,
  isDefined,
} from 'twenty-shared/utils';
import {
  canBeCastAsNumberOrNull,
  castAsNumberOrNull,
} from '~/utils/cast-as-number-or-null';

type RecordFormCurrencyFieldInputProps = {
  label?: string;
  defaultValue?: FieldCurrencyValue;
  defaultCurrencyCode?: CurrencyCode;
  onChange: (value: FormFieldCurrencyValue) => void;
  readonly?: boolean;
  placeholder?: string;
};

export const RecordFormCurrencyFieldInput = ({
  label,
  defaultValue,
  defaultCurrencyCode,
  onChange,
  readonly,
  placeholder,
}: RecordFormCurrencyFieldInputProps) => {
  const setRecordFieldInputIsFieldInError = useSetAtomComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const amountMicros = defaultValue?.amountMicros ?? null;

  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(
    isNonEmptyString(defaultValue?.currencyCode)
      ? defaultValue.currencyCode
      : (defaultCurrencyCode ?? CurrencyCode.USD),
  );
  const [amountText, setAmountText] = useState(
    isDefined(amountMicros)
      ? String(convertCurrencyMicrosToCurrencyAmount(amountMicros))
      : '',
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );

  const emitCurrencyValue = (
    newCurrencyCode: CurrencyCode,
    newAmountMicros: number | null,
  ) =>
    onChange(
      isDefined(newAmountMicros)
        ? { currencyCode: newCurrencyCode, amountMicros: newAmountMicros }
        : { currencyCode: null, amountMicros: null },
    );

  const handleCurrencyCodeChange = (newCurrencyCode: string) => {
    setCurrencyCode(newCurrencyCode as CurrencyCode);
    emitCurrencyValue(newCurrencyCode as CurrencyCode, amountMicros);
  };

  const handleAmountTextChange = (newAmountText: string) => {
    setAmountText(newAmountText);

    const trimmedAmountText = newAmountText.trim();

    if (!canBeCastAsNumberOrNull(trimmedAmountText)) {
      setErrorMessage(t`Invalid number`);
      setRecordFieldInputIsFieldInError(true);
      return;
    }

    setErrorMessage(undefined);
    setRecordFieldInputIsFieldInError(false);

    const amount = castAsNumberOrNull(trimmedAmountText);

    emitCurrencyValue(
      currencyCode,
      isDefined(amount) ? convertCurrencyAmountToCurrencyMicros(amount) : null,
    );
  };

  return (
    <RecordFormTextInput
      label={label}
      value={amountText}
      onChange={handleAmountTextChange}
      placeholder={
        isNonEmptyString(placeholder) ? placeholder : t`Enter a number`
      }
      readonly={readonly}
      error={errorMessage}
      picker={
        <CurrencyPickerDropdownButton
          selectedCurrencyCode={currencyCode}
          onChange={handleCurrencyCodeChange}
          disabled={readonly}
        />
      }
    />
  );
};
