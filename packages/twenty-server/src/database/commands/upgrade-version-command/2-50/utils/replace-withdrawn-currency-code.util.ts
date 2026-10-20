import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const WITHDRAWN_CURRENCY_CODE = 'ANG';
export const REPLACEMENT_CURRENCY_CODE = 'XCG';

const QUOTED_WITHDRAWN_CURRENCY_CODE = `'${WITHDRAWN_CURRENCY_CODE}'`;
const QUOTED_REPLACEMENT_CURRENCY_CODE = `'${REPLACEMENT_CURRENCY_CODE}'`;

type MappedValue<TValue = unknown> = { value: TValue; hasChanged: boolean };

const parseJson = (value: string): { parsed: unknown } | undefined => {
  try {
    return { parsed: JSON.parse(value) };
  } catch {
    return undefined;
  }
};

const toMappedValue = ({
  original,
  mapped,
}: {
  original: unknown;
  mapped: unknown;
}): MappedValue =>
  JSON.stringify(original) === JSON.stringify(mapped)
    ? { value: original, hasChanged: false }
    : { value: mapped, hasChanged: true };

export const replaceWithdrawnCurrencyCodeInFilterValue = (
  value: unknown,
): MappedValue => {
  if (!isString(value)) {
    return { value, hasChanged: false };
  }

  const json = parseJson(value);

  if (
    !isDefined(json) ||
    !Array.isArray(json.parsed) ||
    !json.parsed.includes(WITHDRAWN_CURRENCY_CODE)
  ) {
    return { value, hasChanged: false };
  }

  const currencyCodes = [
    ...new Set(
      json.parsed.map((currencyCode) =>
        currencyCode === WITHDRAWN_CURRENCY_CODE
          ? REPLACEMENT_CURRENCY_CODE
          : currencyCode,
      ),
    ),
  ];

  return { value: JSON.stringify(currencyCodes), hasChanged: true };
};

export const replaceWithdrawnCurrencyCodeInDefaultValue = (
  defaultValue: FlatFieldMetadata['defaultValue'],
): MappedValue<FlatFieldMetadata['defaultValue']> => {
  if (
    !isPlainObject(defaultValue) ||
    !('currencyCode' in defaultValue) ||
    defaultValue.currencyCode !== QUOTED_WITHDRAWN_CURRENCY_CODE
  ) {
    return { value: defaultValue, hasChanged: false };
  }

  return {
    value: { ...defaultValue, currencyCode: QUOTED_REPLACEMENT_CURRENCY_CODE },
    hasChanged: true,
  };
};

const replaceWithdrawnCurrencyCodeInRecordFilter = ({
  recordFilter,
  currencyFieldMetadataIds,
}: {
  recordFilter: unknown;
  currencyFieldMetadataIds: Set<string>;
}): unknown => {
  if (
    !isPlainObject(recordFilter) ||
    !isString(recordFilter.fieldMetadataId) ||
    !currencyFieldMetadataIds.has(recordFilter.fieldMetadataId) ||
    recordFilter.subFieldName !== 'currencyCode'
  ) {
    return recordFilter;
  }

  const { value, hasChanged } = replaceWithdrawnCurrencyCodeInFilterValue(
    recordFilter.value,
  );

  return hasChanged ? { ...recordFilter, value } : recordFilter;
};

const replaceWithdrawnCurrencyCodeInFilter = ({
  filter,
  currencyFieldMetadataIds,
}: {
  filter: unknown;
  currencyFieldMetadataIds: Set<string>;
}): unknown => {
  if (!isPlainObject(filter) || !Array.isArray(filter.recordFilters)) {
    return filter;
  }

  return {
    ...filter,
    recordFilters: filter.recordFilters.map((recordFilter) =>
      replaceWithdrawnCurrencyCodeInRecordFilter({
        recordFilter,
        currencyFieldMetadataIds,
      }),
    ),
  };
};

export const replaceWithdrawnCurrencyCodeInFindRecordsSteps = ({
  steps,
  currencyFieldMetadataIds,
}: {
  steps: unknown;
  currencyFieldMetadataIds: Set<string>;
}): MappedValue => {
  if (!Array.isArray(steps)) {
    return { value: steps, hasChanged: false };
  }

  const mappedSteps = steps.map((step) => {
    if (
      !isPlainObject(step) ||
      step.type !== 'FIND_RECORDS' ||
      !isPlainObject(step.settings) ||
      !isPlainObject(step.settings.input)
    ) {
      return step;
    }

    return {
      ...step,
      settings: {
        ...step.settings,
        input: {
          ...step.settings.input,
          filter: replaceWithdrawnCurrencyCodeInFilter({
            filter: step.settings.input.filter,
            currencyFieldMetadataIds,
          }),
        },
      },
    };
  });

  return toMappedValue({ original: steps, mapped: mappedSteps });
};

export const replaceWithdrawnCurrencyCodeInChartConfiguration = ({
  configuration,
  currencyFieldMetadataIds,
}: {
  configuration: unknown;
  currencyFieldMetadataIds: Set<string>;
}): MappedValue => {
  if (!isPlainObject(configuration) || !('filter' in configuration)) {
    return { value: configuration, hasChanged: false };
  }

  return toMappedValue({
    original: configuration,
    mapped: {
      ...configuration,
      filter: replaceWithdrawnCurrencyCodeInFilter({
        filter: configuration.filter,
        currencyFieldMetadataIds,
      }),
    },
  });
};
