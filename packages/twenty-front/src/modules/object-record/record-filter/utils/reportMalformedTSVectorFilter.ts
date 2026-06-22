const reportedMalformedTSVectorFilterKeys = new Set<string>();

const getRuntimeValueType = (value: unknown) => {
  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  return typeof value;
};

export const reportMalformedTSVectorFilter = async ({
  objectMetadataNameSingular,
  filterKey,
  search,
}: {
  objectMetadataNameSingular: string;
  filterKey: string;
  search: unknown;
}) => {
  const searchRuntimeType = getRuntimeValueType(search);
  const reportKey = `${objectMetadataNameSingular}:${filterKey}:${searchRuntimeType}`;

  if (reportedMalformedTSVectorFilterKeys.has(reportKey)) {
    return;
  }

  reportedMalformedTSVectorFilterKeys.add(reportKey);

  try {
    const { captureMessage, withScope } = await import('@sentry/react');

    withScope((scope) => {
      scope.setLevel('warning');
      scope.setFingerprint([
        'optimistic-record-filter-malformed-ts-vector-search',
        objectMetadataNameSingular,
        filterKey,
        searchRuntimeType,
      ]);
      scope.setTag('record-filter-type', 'ts-vector');
      scope.setContext('optimistic-record-filter-context', {
        objectMetadataNameSingular,
        filterKey,
        searchRuntimeType,
      });

      captureMessage('Malformed TS vector filter search payload in optimistic matcher.');
    });
  } catch (sentryError) {
    // oxlint-disable-next-line no-console
    console.error(
      'Failed to capture malformed ts vector filter event:',
      sentryError,
    );
  }
};
