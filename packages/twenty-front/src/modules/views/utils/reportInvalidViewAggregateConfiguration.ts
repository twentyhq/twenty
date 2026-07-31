import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';

type ReportInvalidViewAggregateConfigurationInput = {
  viewId: string;
  objectMetadataItemId: string;
  aggregateOperation: AggregateOperations;
  aggregateFieldMetadataId: string | null | undefined;
};

const reportedInvalidViewAggregateConfigurationSignatures = new Set<string>();

export const reportInvalidViewAggregateConfiguration = async ({
  viewId,
  objectMetadataItemId,
  aggregateOperation,
  aggregateFieldMetadataId,
}: ReportInvalidViewAggregateConfigurationInput) => {
  const normalizedAggregateFieldMetadataId = aggregateFieldMetadataId ?? null;
  const signature = [
    objectMetadataItemId,
    viewId,
    aggregateOperation,
    normalizedAggregateFieldMetadataId ?? 'missing',
  ].join(':');

  if (reportedInvalidViewAggregateConfigurationSignatures.has(signature)) {
    return;
  }

  reportedInvalidViewAggregateConfigurationSignatures.add(signature);

  try {
    const { captureMessage, withScope } = await import('@sentry/react');

    withScope((scope) => {
      scope.setLevel('warning');
      scope.setFingerprint([
        'invalid-view-aggregate-configuration',
        objectMetadataItemId,
        viewId,
      ]);
      scope.setTag('view-id', viewId);
      scope.setTag('object-metadata-item-id', objectMetadataItemId);
      scope.setTag('aggregate-operation', aggregateOperation);
      scope.setContext('invalid-view-aggregate-configuration', {
        viewId,
        objectMetadataItemId,
        aggregateOperation,
        aggregateFieldMetadataId: normalizedAggregateFieldMetadataId,
      });

      captureMessage(
        'View contains an aggregate operation without a resolvable field metadata item.',
      );
    });
  } catch (sentryError) {
    // oxlint-disable-next-line no-console
    console.error(
      'Failed to capture invalid view aggregate configuration monitoring event:',
      sentryError,
    );
  }
};
