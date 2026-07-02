type ReportInvalidViewFieldDefinitionsInput = {
  viewId: string;
  objectMetadataItemId: string;
  unresolvedFieldMetadataIds: string[];
};

const reportedInvalidViewFieldDefinitionSignatures = new Set<string>();

export const reportInvalidViewFieldDefinitions = async ({
  viewId,
  objectMetadataItemId,
  unresolvedFieldMetadataIds,
}: ReportInvalidViewFieldDefinitionsInput) => {
  if (unresolvedFieldMetadataIds.length === 0) {
    return;
  }

  const uniqueUnresolvedFieldMetadataIds = [
    ...new Set(unresolvedFieldMetadataIds),
  ].sort();

  const signature = `${viewId}:${uniqueUnresolvedFieldMetadataIds.join(',')}`;

  if (reportedInvalidViewFieldDefinitionSignatures.has(signature)) {
    return;
  }

  reportedInvalidViewFieldDefinitionSignatures.add(signature);

  try {
    const { captureMessage, withScope } = await import('@sentry/react');

    withScope((scope) => {
      scope.setLevel('warning');
      scope.setFingerprint([
        'invalid-view-field-definitions',
        objectMetadataItemId,
        viewId,
      ]);
      scope.setTag('view-id', viewId);
      scope.setTag('object-metadata-item-id', objectMetadataItemId);
      scope.setContext('invalid-view-field-definitions', {
        viewId,
        objectMetadataItemId,
        unresolvedFieldMetadataIds: uniqueUnresolvedFieldMetadataIds,
        unresolvedFieldMetadataIdsCount: uniqueUnresolvedFieldMetadataIds.length,
      });

      captureMessage('View contains unresolved field metadata identifiers.');
    });
  } catch (sentryError) {
    // oxlint-disable-next-line no-console
    console.error(
      'Failed to capture invalid view field definitions monitoring event:',
      sentryError,
    );
  }
};
