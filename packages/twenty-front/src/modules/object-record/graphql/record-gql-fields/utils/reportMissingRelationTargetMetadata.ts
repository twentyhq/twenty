type ReportMissingRelationTargetMetadataInput = {
  fieldMetadataName: string;
  missingTargetNames: string[];
  relationFieldType: 'relation' | 'morph-relation';
};

const reportedMissingRelationTargetMetadataKeys = new Set<string>();

export const reportMissingRelationTargetMetadata = async ({
  fieldMetadataName,
  missingTargetNames,
  relationFieldType,
}: ReportMissingRelationTargetMetadataInput) => {
  const sortedMissingTargetNames = [...missingTargetNames].sort();

  const deduplicationKey = [
    fieldMetadataName,
    relationFieldType,
    sortedMissingTargetNames.join(','),
  ].join('|');

  if (reportedMissingRelationTargetMetadataKeys.has(deduplicationKey)) {
    return;
  }

  reportedMissingRelationTargetMetadataKeys.add(deduplicationKey);

  try {
    const { captureMessage, withScope } = await import('@sentry/react');

    withScope((scope) => {
      scope.setLevel('warning');
      scope.setFingerprint([
        'record-gql-fields-missing-relation-target-metadata',
        relationFieldType,
        fieldMetadataName,
      ]);
      scope.setTag('module', 'record-gql-fields');
      scope.setTag('relationFieldType', relationFieldType);
      scope.setContext('missing-relation-target-metadata', {
        fieldMetadataName,
        missingTargetNames: sortedMissingTargetNames,
        pathname: window.location.pathname,
      });

      captureMessage('Missing relation target metadata while building record gql fields.');
    });
  } catch (error) {
    // oxlint-disable-next-line no-console
    console.error('Failed to capture missing relation target metadata:', error);
  }
};
