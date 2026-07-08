import { FieldMetadataType, RelationType } from 'twenty-shared/types';

type ReportMissingRelationTargetMetadataInput = {
  fieldMetadataName: string;
  relationFieldType: FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION;
  relationType: RelationType | undefined;
  targetObjectMetadataNameSingular?: string;
};

const reportedMissingRelationTargets = new Set<string>();

const getReportKey = ({
  fieldMetadataName,
  relationFieldType,
  relationType,
  targetObjectMetadataNameSingular,
}: ReportMissingRelationTargetMetadataInput) => {
  return [
    fieldMetadataName,
    relationFieldType,
    relationType ?? 'unknown',
    targetObjectMetadataNameSingular ?? 'unknown',
  ].join(':');
};

export const reportMissingRelationTargetMetadata = async ({
  fieldMetadataName,
  relationFieldType,
  relationType,
  targetObjectMetadataNameSingular,
}: ReportMissingRelationTargetMetadataInput) => {
  const reportKey = getReportKey({
    fieldMetadataName,
    relationFieldType,
    relationType,
    targetObjectMetadataNameSingular,
  });

  if (reportedMissingRelationTargets.has(reportKey)) {
    return;
  }

  reportedMissingRelationTargets.add(reportKey);

  try {
    const { captureMessage, withScope } = await import('@sentry/react');

    withScope((scope) => {
      scope.setLevel('warning');
      scope.setFingerprint([
        'record-gql-fields-missing-relation-target-metadata',
        relationFieldType,
        fieldMetadataName,
        targetObjectMetadataNameSingular ?? 'unknown',
      ]);
      scope.setTag('module', 'object-record');
      scope.setTag('feature', 'record-gql-fields');
      scope.setTag('relationFieldType', relationFieldType);
      scope.setTag('relationType', relationType ?? 'unknown');
      scope.setContext('missing-relation-target-metadata', {
        fieldMetadataName,
        relationFieldType,
        relationType: relationType ?? 'unknown',
        targetObjectMetadataNameSingular:
          targetObjectMetadataNameSingular ?? 'unknown',
      });

      captureMessage(
        'Missing relation target metadata while generating record GraphQL fields.',
      );
    });
  } catch (sentryError) {
    // oxlint-disable-next-line no-console
    console.error('Failed to capture missing relation target metadata:', sentryError);
  }
};
