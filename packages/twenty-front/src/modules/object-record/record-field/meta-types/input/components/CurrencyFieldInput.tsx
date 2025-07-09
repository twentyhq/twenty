import { isNonEmptyString } from '@sniptt/guards';

import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { FieldCurrencyValue } from '@/object-record/record-field/types/FieldMetadata';
import { CurrencyInput } from '@/ui/field/input/components/CurrencyInput';

import { useCurrencyField } from '../../hooks/useCurrencyField';

import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from '@/object-record/record-field/types/FieldInputEvent';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

type CurrencyFieldInputProps = {
  onClickOutside?: FieldInputClickOutsideEvent;
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
  const { draftValue, persistCurrencyField, setDraftValue, defaultValue } =
    useCurrencyField();

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const defaultCurrencyCodeWithoutSQLQuotes = (
    defaultValue as FieldCurrencyValue
  ).currencyCode.replace(/'/g, '') as CurrencyCode;

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

  const handleEnter = (newValue: string) => {
    onEnter?.(() => {
      persistCurrencyField({
        amountText: newValue,
        currencyCode,
      });
    });
  };

  const handleEscape = (newValue: string) => {
    onEscape?.(() => {
      persistCurrencyField({
        amountText: newValue,
        currencyCode,
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
        currencyCode,
      });
    }, event);
  };

  const handleTab = (newValue: string) => {
    onTab?.(() => {
      persistCurrencyField({
        amountText: newValue,
        currencyCode,
      });
    });
  };

  const handleShiftTab = (newValue: string) => {
    onShiftTab?.(() =>
      persistCurrencyField({
        amountText: newValue,
        currencyCode,
      }),
    );
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
      autoFocus
      placeholder="Currency"
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
