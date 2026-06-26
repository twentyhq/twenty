type ReportMissingRelationTargetMetadataInput = {
  fieldMetadataName: string;
  missingTargetNames: string[];
  relationFieldType: 'relation' | 'morph-relation';
};

const reportedMissingRelationTargetMetadataSignatures = new Set<string>();

const getReportSignature = ({
  fieldMetadataName,
  missingTargetNames,
  relationFieldType,
}: ReportMissingRelationTargetMetadataInput) =>
  `${relationFieldType}:${fieldMetadataName}:${missingTargetNames
    .slice()
    .sort()
    .join(',')}`;

export const reportMissingRelationTargetMetadata = async ({
  fieldMetadataName,
  missingTargetNames,
  relationFieldType,
}: ReportMissingRelationTargetMetadataInput) => {
  const uniqueMissingTargetNames = [...new Set(missingTargetNames)];

  if (uniqueMissingTargetNames.length === 0) {
    return;
  }

  const reportSignature = getReportSignature({
    fieldMetadataName,
    missingTargetNames: uniqueMissingTargetNames,
    relationFieldType,
  });

  if (reportedMissingRelationTargetMetadataSignatures.has(reportSignature)) {
    return;
  }

  reportedMissingRelationTargetMetadataSignatures.add(reportSignature);

  const { captureMessage, withScope } = await import('@sentry/react');

  withScope((scope) => {
    scope.setLevel('warning');
    scope.setFingerprint([
      'record-gql-fields-missing-relation-target-metadata',
      relationFieldType,
      fieldMetadataName,
    ]);
    scope.setTag('module', 'object-record');
    scope.setExtra('fieldMetadataName', fieldMetadataName);
    scope.setExtra('missingTargetNames', uniqueMissingTargetNames);

    if (typeof window !== 'undefined') {
      scope.setExtra('pathname', window.location.pathname);
    }

    captureMessage(
      'Missing relation target metadata while generating record gql fields',
    );
  });
};
