import { isObject } from '@sniptt/guards';

const reportedMalformedSelectFilterKeys = new Set<string>();
const supportedSelectFilterOperators = new Set(['eq', 'in', 'is', 'neq']);

export const reportMalformedSelectFilter = async ({
  objectMetadataNameSingular,
  filterKey,
  selectFilter,
}: {
  objectMetadataNameSingular: string;
  filterKey: string;
  selectFilter: unknown;
}) => {
  const operators = isObject(selectFilter) ? Object.keys(selectFilter) : [];
  const unsupportedOperators = isObject(selectFilter)
    ? operators.filter(
        (operator) => !supportedSelectFilterOperators.has(operator),
      )
    : ['invalid'];

  if (unsupportedOperators.length === 0 && operators.length > 0) {
    return;
  }

  if (unsupportedOperators.length === 0) {
    unsupportedOperators.push('missing');
  }

  const reportKey = `${objectMetadataNameSingular}:${filterKey}:${unsupportedOperators.join(',')}`;

  if (reportedMalformedSelectFilterKeys.has(reportKey)) {
    return;
  }

  reportedMalformedSelectFilterKeys.add(reportKey);

  try {
    const { captureMessage, withScope } = await import('@sentry/react');

    withScope((scope) => {
      scope.setLevel('warning');
      scope.setFingerprint([
        'optimistic-record-filter-malformed-select-operator',
        objectMetadataNameSingular,
        filterKey,
        ...unsupportedOperators,
      ]);
      scope.setTag('record-filter-type', 'select');
      scope.setTag('object-metadata-name-singular', objectMetadataNameSingular);
      scope.setTag('filter-key', filterKey);
      scope.setTag(
        'unsupported-filter-operators',
        unsupportedOperators.join(','),
      );
      scope.setContext('optimistic-record-filter-context', {
        objectMetadataNameSingular,
        filterKey,
        unsupportedOperators,
      });

      captureMessage(
        'Malformed select filter operator in optimistic matcher.',
      );
    });
  } catch (sentryError) {
    // oxlint-disable-next-line no-console
    console.error(
      'Failed to capture malformed select filter event:',
      sentryError,
    );
  }
};
