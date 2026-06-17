type ReportMissingRelationTargetMetadataInput = {
  fieldMetadataName: string;
  missingTargetNames: string[];
  relationFieldType: 'relation' | 'morph-relation';
};

const reportedMissingRelationTargets = new Set<string>();

export const reportMissingRelationTargetMetadata = async ({
  fieldMetadataName,
  missingTargetNames,
  relationFieldType,
}: ReportMissingRelationTargetMetadataInput) => {
  const sortedMissingTargetNames = [...missingTargetNames].sort((a, b) =>
    a.localeCompare(b),
  );

  const dedupeKey = [
    relationFieldType,
    fieldMetadataName,
    ...sortedMissingTargetNames,
  ].join(':');

  if (reportedMissingRelationTargets.has(dedupeKey)) {
    return;
  }

  reportedMissingRelationTargets.add(dedupeKey);

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
      });

      captureMessage(
        'Relation target metadata is missing while generating record GraphQL fields.',
      );
    });
  } catch (sentryError) {
    // oxlint-disable-next-line no-console
    console.error(
      'Failed to capture missing relation target metadata event:',
      sentryError,
    );
  }
};
