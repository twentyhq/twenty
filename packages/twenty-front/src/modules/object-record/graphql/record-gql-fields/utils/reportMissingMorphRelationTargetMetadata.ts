type ReportMissingMorphRelationTargetMetadataArgs = {
  fieldMetadataName: string;
  missingMorphTargetNames: string[];
};

const MORPH_RELATION_TARGET_METADATA_MISMATCH_MESSAGE =
  'Missing morph target object metadata while generating record GraphQL fields';

export const reportMissingMorphRelationTargetMetadata = ({
  fieldMetadataName,
  missingMorphTargetNames,
}: ReportMissingMorphRelationTargetMetadataArgs) => {
  const pathname =
    typeof window === 'undefined' ? undefined : window.location.pathname;
  const uniqueMissingMorphTargetNames = [...new Set(missingMorphTargetNames)];

  // oxlint-disable-next-line no-console
  console.warn(MORPH_RELATION_TARGET_METADATA_MISMATCH_MESSAGE, {
    fieldMetadataName,
    missingMorphTargetNames: uniqueMissingMorphTargetNames,
    pathname,
  });

  import('@sentry/react')
    .then(({ captureMessage, withScope }) => {
      withScope((scope) => {
        scope.setLevel('warning');
        scope.setTag('error_type', 'morph_target_metadata_mismatch');
        scope.setTag('field_name', fieldMetadataName);
        scope.setExtra(
          'missingMorphTargetNames',
          uniqueMissingMorphTargetNames,
        );
        scope.setExtra('pathname', pathname);
        scope.setFingerprint([
          'morph_target_metadata_mismatch',
          fieldMetadataName,
          ...[...uniqueMissingMorphTargetNames].sort(),
        ]);

        captureMessage(MORPH_RELATION_TARGET_METADATA_MISMATCH_MESSAGE);
      });
    })
    .catch((sentryError) => {
      // oxlint-disable-next-line no-console
      console.warn(
        'Failed to capture morph target metadata mismatch warning with Sentry:',
        sentryError,
      );
    });
};
