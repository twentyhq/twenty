const SUPPORTED_SELECT_FILTER_OPERATORS = new Set(['in', 'is', 'eq', 'neq']);

const reportedMalformedSelectFilters = new Set<string>();

const getInvalidOperatorKeys = (selectFilter: unknown): string[] => {
  if (selectFilter === null || typeof selectFilter !== 'object') {
    return [];
  }

  return Object.keys(selectFilter)
    .filter(
      (operatorKey) => !SUPPORTED_SELECT_FILTER_OPERATORS.has(operatorKey),
    )
    .sort();
};

export const reportMalformedSelectFilter = async ({
  objectMetadataNameSingular,
  filterKey,
  selectFilter,
}: {
  objectMetadataNameSingular: string;
  filterKey: string;
  selectFilter: unknown;
}) => {
  const invalidOperatorKeys = getInvalidOperatorKeys(selectFilter);

  if (invalidOperatorKeys.length === 0) {
    return;
  }

  const reportKey = [
    objectMetadataNameSingular,
    filterKey,
    ...invalidOperatorKeys,
  ].join(':');

  if (reportedMalformedSelectFilters.has(reportKey)) {
    return;
  }

  reportedMalformedSelectFilters.add(reportKey);

  try {
    const { captureMessage, withScope } = await import('@sentry/react');

    withScope((scope) => {
      scope.setLevel('warning');
      scope.setFingerprint([
        'optimistic-filter-matcher',
        'malformed-select-filter',
        objectMetadataNameSingular,
        filterKey,
        ...invalidOperatorKeys,
      ]);
      scope.setTag('error-handler', 'optimistic-filter-matcher');
      scope.setTag('filter-type', 'select');
      scope.setTag('object-metadata', objectMetadataNameSingular);
      scope.setTag('filter-key', filterKey);
      scope.setTag('invalid-operators', invalidOperatorKeys.join(','));
      scope.setContext('optimistic-filter', {
        objectMetadataNameSingular,
        filterKey,
        invalidOperatorKeys,
      });

      captureMessage(
        'Malformed SELECT filter encountered during optimistic matching.',
      );
    });
  } catch (sentryError) {
    // oxlint-disable-next-line no-console
    console.error(
      'Failed to report malformed SELECT filter to Sentry:',
      sentryError,
    );
  }
};
