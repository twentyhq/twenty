import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { type FieldCurrencyValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { CurrencyInput } from '@/ui/field/input/components/CurrencyInput';
import { CurrencyCode } from 'twenty-shared/constants';

import { useCurrencyField } from '@/object-record/record-field/ui/meta-types/hooks/useCurrencyField';

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';

import { isFieldCurrencyValue } from '@/object-record/record-field/ui/types/guards/isFieldCurrencyValue';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useContext } from 'react';
import { convertCurrencyAmountToCurrencyMicros } from '~/utils/convertCurrencyToCurrencyMicros';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const CurrencyFieldInput = () => {
  const { draftValue, setDraftValue, defaultValue, decimals } =
    useCurrencyField();

  const { onClickOutside, onEnter, onEscape, onShiftTab, onTab } = useContext(
    FieldInputEventContext,
  );

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const defaultCurrencyCodeWithoutSQLQuotes = (
    defaultValue as FieldCurrencyValue
  )?.currencyCode?.replace(/'/g, '') as CurrencyCode;

  const defaultCurrencyCodeIsNotEmpty = isNonEmptyString(
    defaultCurrencyCodeWithoutSQLQuotes,
  );

  const draftCurrencyCode = draftValue?.currencyCode;

  const draftCurrencyCodeIsEmptyIsNotEmpty =
    isNonEmptyString(draftCurrencyCode);

  const currencyCode = draftCurrencyCodeIsEmptyIsNotEmpty
    ? draftCurrencyCode
    : defaultCurrencyCodeIsNotEmpty
      ? defaultCurrencyCodeWithoutSQLQuotes
      : CurrencyCode.USD;

  const getNewCurrencyValue = ({
    amountText,
    currencyCode,
  }: {
    amountText: string;
    currencyCode: string;
  }) => {
    const amount = parseFloat(amountText);

    const newCurrencyValue = {
      amountMicros: isNaN(amount)
        ? null
        : convertCurrencyAmountToCurrencyMicros(amount),
      currencyCode,
    };

    if (!isFieldCurrencyValue(newCurrencyValue)) {
      return;
    }

    return newCurrencyValue;
  };

  const handleEnter = (newValue: string) => {
    onEnter?.({
      newValue: getNewCurrencyValue({
        amountText: newValue,
        currencyCode,
      }),
    });
  };

  const handleEscape = (newValue: string) => {
    onEscape?.({
      newValue: getNewCurrencyValue({
        amountText: newValue,
        currencyCode,
      }),
    });
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newValue: string,
  ) => {
    onClickOutside?.({
      newValue: getNewCurrencyValue({
        amountText: newValue,
        currencyCode,
      }),
      event,
    });
  };

  const handleTab = (newValue: string) => {
    onTab?.({
      newValue: getNewCurrencyValue({
        amountText: newValue,
        currencyCode,
      }),
    });
  };

  const handleShiftTab = (newValue: string) => {
    onShiftTab?.({
      newValue: getNewCurrencyValue({
        amountText: newValue,
        currencyCode,
      }),
    });
  };

  const handleChange = (newValue: string) => {
    setDraftValue({
      amount: newValue,
      currencyCode,
    });
  };

  const handleSelect = (newValue: string) => {
    setDraftValue({
      amount: isUndefinedOrNull(draftValue?.amount) ? '' : draftValue?.amount,
      currencyCode: newValue as CurrencyCode,
    });
  };

  return (
    <CurrencyInput
      instanceId={instanceId}
      value={draftValue?.amount?.toString() ?? ''}
      currencyCode={currencyCode}
      decimals={decimals}
      autoFocus
      placeholder={t`Currency`}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      onShiftTab={handleShiftTab}
      onTab={handleTab}
      onChange={handleChange}
      onSelect={handleSelect}
    />
  );
};
