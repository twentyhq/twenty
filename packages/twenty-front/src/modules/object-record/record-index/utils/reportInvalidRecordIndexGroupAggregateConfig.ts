import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';

export const reportInvalidRecordIndexGroupAggregateConfig = async ({
  objectNameSingular,
  recordIndexId,
  recordIndexGroupAggregateOperation,
}: {
  objectNameSingular: string;
  recordIndexId: string;
  recordIndexGroupAggregateOperation: ExtendedAggregateOperations;
}) => {
  try {
    const { captureMessage, withScope } = await import('@sentry/react');

    withScope((scope) => {
      scope.setLevel('warning');
      scope.setFingerprint([
        'record-index-invalid-group-aggregate-config',
        objectNameSingular,
        recordIndexGroupAggregateOperation,
      ]);
      scope.setTag('module', 'record-index');
      scope.setContext('record-index-group-aggregate', {
        objectNameSingular,
        recordIndexId,
        recordIndexGroupAggregateOperation,
      });

      captureMessage(
        'Record index grouped aggregate has an operation without a resolvable field metadata item.',
      );
    });
  } catch (sentryError) {
    // oxlint-disable-next-line no-console
    console.error(
      'Failed to capture invalid record index group aggregate config event:',
      sentryError,
    );
  }
};
