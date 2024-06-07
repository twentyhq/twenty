import { CurrencyFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';

export const isMatchingCurrencyFilter = ({
  currencyFilter,
  value,
}: {
  currencyFilter: CurrencyFilter;
  value: number;
}) => {
  switch (true) {
    case currencyFilter.amountMicros?.eq !== undefined: {
      return value === currencyFilter.amountMicros.eq;
    }
    case currencyFilter.amountMicros?.neq !== undefined: {
      return value !== currencyFilter.amountMicros.neq;
    }
    case currencyFilter.amountMicros?.gt !== undefined: {
      return value > currencyFilter.amountMicros.gt;
    }
    case currencyFilter.amountMicros?.gte !== undefined: {
      return value >= currencyFilter.amountMicros.gte;
    }
    case currencyFilter.amountMicros?.lt !== undefined: {
      return value < currencyFilter.amountMicros.lt;
    }
    case currencyFilter.amountMicros?.lte !== undefined: {
      return value <= currencyFilter.amountMicros.lte;
    }
    case currencyFilter.amountMicros?.in !== undefined: {
      return currencyFilter.amountMicros.in.includes(value);
    }
    case currencyFilter.amountMicros?.is !== undefined: {
      if (currencyFilter.amountMicros.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    default: {
      throw new Error(
        `Unexpected amountMicros for currency filter : ${JSON.stringify(
          currencyFilter.amountMicros,
        )}`,
      );
    }
  }
};
