import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

type MetadataFieldDescriptor = Pick<FieldMetadataItem, 'name' | 'type'>;

type ReportMissingOptimisticFilterMetadataInput = {
  objectMetadataNameSingular: string;
  filterKey: string;
  metadataFields: MetadataFieldDescriptor[];
};

const reportedMissingOptimisticFilterMetadata = new Set<string>();

const relationFieldTypes = new Set<FieldMetadataType>([
  FieldMetadataType.RELATION,
  FieldMetadataType.MORPH_RELATION,
]);

const computeMetadataHash = (metadataFields: MetadataFieldDescriptor[]) => {
  const metadataSnapshot = metadataFields
    .map(({ name, type }) => `${name}:${type}`)
    .sort()
    .join('|');

  let hash = 0;

  for (const character of metadataSnapshot) {
    hash = (hash * 31 + character.charCodeAt(0)) | 0;
  }

  return (hash >>> 0).toString(16);
};

export const reportMissingOptimisticFilterMetadata = async ({
  objectMetadataNameSingular,
  filterKey,
  metadataFields,
}: ReportMissingOptimisticFilterMetadataInput) => {
  const metadataHash = computeMetadataHash(metadataFields);
  const reportKey = `${objectMetadataNameSingular}:${filterKey}:${metadataHash}`;

  if (reportedMissingOptimisticFilterMetadata.has(reportKey)) {
    return;
  }

  reportedMissingOptimisticFilterMetadata.add(reportKey);

  const metadataFieldNames = metadataFields
    .map(({ name }) => name)
    .sort();
  const metadataHasRelationField = metadataFields.some(({ type }) =>
    relationFieldTypes.has(type),
  );

  try {
    const { captureMessage, withScope } = await import('@sentry/react');

    withScope((scope) => {
      scope.setLevel('warning');
      scope.setFingerprint([
        'optimistic-filter-matcher',
        'missing-filter-metadata',
        objectMetadataNameSingular,
        filterKey,
        metadataHash,
      ]);
      scope.setTag('error-handler', 'optimistic-filter-metadata');
      scope.setTag('object-metadata', objectMetadataNameSingular);
      scope.setTag('filter-key', filterKey);
      scope.setTag('metadata-field-count', String(metadataFields.length));
      scope.setTag('metadata-hash', metadataHash);
      scope.setTag(
        'metadata-has-relation-field',
        String(metadataHasRelationField),
      );
      scope.setContext('optimistic-filter-metadata', {
        objectMetadataNameSingular,
        filterKey,
        metadataFieldCount: metadataFields.length,
        metadataFieldNames,
        metadataHash,
        metadataHasRelationField,
      });

      captureMessage(
        'Optimistic filter references a field missing from object metadata.',
      );
    });
  } catch (sentryError) {
    // oxlint-disable-next-line no-console
    console.error(
      'Failed to capture missing optimistic filter metadata:',
      sentryError,
    );
  }
};
