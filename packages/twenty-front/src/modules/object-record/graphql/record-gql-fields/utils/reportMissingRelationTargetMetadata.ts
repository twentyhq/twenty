import { FieldMetadataType, type RelationType } from 'twenty-shared/types';

type ReportMissingRelationTargetMetadataInput = {
  fieldMetadataName: string;
  relationFieldType: FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION;
  relationType: RelationType | undefined;
  targetObjectMetadataNameSingular: string | undefined;
};

const reportedMissingRelationTargetMetadataKeys = new Set<string>();

export const reportMissingRelationTargetMetadata = async ({
  fieldMetadataName,
  relationFieldType,
  relationType,
  targetObjectMetadataNameSingular,
}: ReportMissingRelationTargetMetadataInput) => {
  const deduplicationKey = [
    fieldMetadataName,
    relationFieldType,
    relationType,
    targetObjectMetadataNameSingular,
  ].join('|');

  if (reportedMissingRelationTargetMetadataKeys.has(deduplicationKey)) {
    return;
  }

  reportedMissingRelationTargetMetadataKeys.add(deduplicationKey);

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
    scope.setTag('fieldMetadataName', fieldMetadataName);
    scope.setExtra('relationType', relationType);
    scope.setExtra(
      'targetObjectMetadataNameSingular',
      targetObjectMetadataNameSingular,
    );
    scope.setExtra('pathname', window.location.pathname);

    captureMessage(
      'Missing relation target metadata while generating record gql fields.',
    );
  });
};
