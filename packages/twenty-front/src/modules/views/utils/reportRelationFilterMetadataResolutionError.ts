import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

type ReportRelationFilterMetadataResolutionErrorInput = {
  cause:
    | 'missing-relation-object-metadata-name-singular'
    | 'missing-relation-object-metadata-item';
  recordFilter: RecordFilter;
  relationObjectMetadataNameSingular?: string;
};

export const reportRelationFilterMetadataResolutionError = async ({
  cause,
  recordFilter,
  relationObjectMetadataNameSingular,
}: ReportRelationFilterMetadataResolutionErrorInput) => {
  try {
    const { captureMessage, withScope } = await import('@sentry/react');

    withScope((scope) => {
      scope.setLevel('warning');
      scope.setFingerprint(['relation-filter-metadata-resolution', cause]);
      scope.setTag('error-handler', 'relation-filter-metadata-resolution');
      scope.setContext('relation-filter-metadata-resolution', {
        cause,
        fieldMetadataId: recordFilter.fieldMetadataId,
        recordFilterId: recordFilter.id,
        relationObjectMetadataNameSingular,
      });

      captureMessage('Relation filter metadata resolution failed.');
    });
  } catch (sentryError) {
    // oxlint-disable-next-line no-console
    console.error(
      'Failed to capture relation filter metadata resolution warning:',
      sentryError,
    );
  }
};
