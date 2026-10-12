import { i18n } from '@lingui/core';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type DatabaseCrudOperation } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

export const getObjectLabelForCrudOperation = ({
  operation,
  objectName,
  objectSlug,
  objectMetadataItems,
}: {
  operation: DatabaseCrudOperation;
  objectName?: string | null;
  objectSlug: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): string | undefined => {
  const objectMetadata = isDefined(objectName)
    ? objectMetadataItems.find(
        (metadataItem) => metadataItem.nameSingular === objectName,
      )
    : objectMetadataItems.find(
        (metadataItem) =>
          metadataItem.nameSingular === objectSlug ||
          metadataItem.namePlural === objectSlug,
      );

  if (!isDefined(objectMetadata)) {
    return undefined;
  }

  const isPluralOperation =
    operation.endsWith('_many') || operation === 'group_by';
  const objectLabel = isPluralOperation
    ? objectMetadata.labelPlural
    : objectMetadata.labelSingular;

  return objectLabel.toLocaleLowerCase(i18n.locale);
};
