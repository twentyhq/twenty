import { type MetadataEntityStoreStatus } from '@/metadata-store/states/metadataStoreState';

export const reportMissingRecordIndexObjectMetadata = async ({
  objectNamePlural,
  pathname,
  metadataStatus,
  metadataCollectionHash,
  metadataReady,
  objectMetadataCount,
  hasMatchingView,
  hasMatchingNavigationMenuItem,
}: {
  objectNamePlural: string;
  pathname: string;
  metadataStatus: MetadataEntityStoreStatus;
  metadataCollectionHash?: string;
  metadataReady: boolean;
  objectMetadataCount: number;
  hasMatchingView: boolean;
  hasMatchingNavigationMenuItem: boolean;
}) => {
  try {
    const { captureMessage, withScope } = await import('@sentry/react');

    withScope((scope) => {
      scope.setLevel('warning');
      scope.setFingerprint(['record-index', 'object-metadata-missing']);
      scope.setTag('module', 'record-index');
      scope.setTag('cause', 'object-metadata-missing');
      scope.setExtra('objectNamePlural', objectNamePlural);
      scope.setExtra('pathname', pathname);
      scope.setExtra('metadataStatus', metadataStatus);
      scope.setExtra('metadataCollectionHash', metadataCollectionHash);
      scope.setExtra('metadataReady', metadataReady);
      scope.setExtra('objectMetadataCount', objectMetadataCount);
      scope.setExtra('hasMatchingView', hasMatchingView);
      scope.setExtra(
        'hasMatchingNavigationMenuItem',
        hasMatchingNavigationMenuItem,
      );

      captureMessage('Record index route has no matching object metadata');
    });
  } catch (error) {
    // oxlint-disable-next-line no-console
    console.error(
      'Failed to report missing record index object metadata:',
      error,
    );
  }
};
