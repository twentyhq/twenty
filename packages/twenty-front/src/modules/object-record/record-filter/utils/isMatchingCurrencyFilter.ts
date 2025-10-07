import { isNonEmptyString } from '@sniptt/guards';
import { type CurrencyFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const isMatchingCurrencyCodeFilter = (
  currencyCodeFilter: CurrencyFilter['currencyCode'],
  value: string | null | undefined,
) => {
  switch (true) {
    case currencyCodeFilter?.in !== undefined: {
      return isNonEmptyString(value) && currencyCodeFilter.in.includes(value);
    }
    case currencyCodeFilter?.is !== undefined: {
      if (currencyCodeFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    default: {
      throw new Error(
        `Unexpected operand for currency code filter : ${JSON.stringify(
          currencyCodeFilter,
        )}`,
      );
    }
  }
};

const isMatchingAmountMicrosFilter = (
  amountMicrosFilter: CurrencyFilter['amountMicros'],
  value: number | null | undefined,
) => {
  switch (true) {
    case amountMicrosFilter?.eq !== undefined: {
      return value === amountMicrosFilter.eq;
    }
    case amountMicrosFilter?.neq !== undefined: {
      return value !== amountMicrosFilter.neq;
    }
    case amountMicrosFilter?.gt !== undefined: {
      return isDefined(value) && value > amountMicrosFilter.gt;
    }
    case amountMicrosFilter?.gte !== undefined: {
      return isDefined(value) && value >= amountMicrosFilter.gte;
    }
    case amountMicrosFilter?.lt !== undefined: {
      return isDefined(value) && value < amountMicrosFilter.lt;
    }
    case amountMicrosFilter?.lte !== undefined: {
      return isDefined(value) && value <= amountMicrosFilter.lte;
    }
    case amountMicrosFilter?.is !== undefined: {
      if (amountMicrosFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    default: {
      throw new Error(
        `Unexpected operand for currency amount micros filter : ${JSON.stringify(
          amountMicrosFilter,
        )}`,
      );
    }
  }
};

export const isMatchingCurrencyFilter = ({
  currencyFilter,
  value,
}: {
  currencyFilter: CurrencyFilter;
  value: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  };
}) => {
  const shouldMatchCurrencyCodeFilter = isDefined(currencyFilter.currencyCode);
  const shouldMatchAmountMicrosFilter = isDefined(currencyFilter.amountMicros);

  if (shouldMatchCurrencyCodeFilter && shouldMatchAmountMicrosFilter) {
    return (
      isMatchingAmountMicrosFilter(
        currencyFilter.amountMicros,
        value.amountMicros,
      ) &&
      isMatchingCurrencyCodeFilter(
        currencyFilter.currencyCode,
        value.currencyCode,
      )
    );
  } else if (shouldMatchAmountMicrosFilter) {
    return isMatchingAmountMicrosFilter(
      currencyFilter.amountMicros,
      value.amountMicros,
    );
  } else if (shouldMatchCurrencyCodeFilter) {
    return isMatchingCurrencyCodeFilter(
      currencyFilter.currencyCode,
      value.currencyCode,
    );
  }

  throw new Error(
    `Unexpected filter for currency : ${JSON.stringify(currencyFilter)}`,
  );
};
