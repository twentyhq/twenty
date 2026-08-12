import { readSlackRecordProperty } from 'src/logic-functions/utils/read-slack-record-property';
import { readSlackRecordText } from 'src/logic-functions/utils/read-slack-record-text';

const MICROS_PER_UNIT = 1_000_000;

const readAmountMicros = (value: unknown): number | undefined => {
  const amountMicros = readSlackRecordProperty(value, 'amountMicros');

  const parsedAmountMicros =
    typeof amountMicros === 'string' ? Number(amountMicros) : amountMicros;

  return typeof parsedAmountMicros === 'number' &&
    Number.isFinite(parsedAmountMicros)
    ? parsedAmountMicros
    : undefined;
};

export const formatSlackRecordCurrency = (
  value: unknown,
): string | undefined => {
  const amountMicros = readAmountMicros(value);

  if (amountMicros === undefined) {
    return undefined;
  }

  const amount = amountMicros / MICROS_PER_UNIT;
  const currencyCode = readSlackRecordText(
    readSlackRecordProperty(value, 'currencyCode'),
  );
  const fractionDigits = Number.isInteger(amount) ? 0 : 2;

  if (currencyCode === undefined) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
  } catch {
    return `${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount)} ${currencyCode}`;
  }
};
