import {
  CRUD_TOOL_PLURAL_OPERATIONS,
  type CrudToolOperation,
} from '@/ai/constants/crud-tool-operation-verbs.constant';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getObjectLabelForCrudOperation = ({
  operation,
  objectName,
  objectSlug,
  objectMetadataItems,
}: {
  operation: CrudToolOperation;
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

  const objectLabel = CRUD_TOOL_PLURAL_OPERATIONS.has(operation)
    ? objectMetadata.labelPlural
    : objectMetadata.labelSingular;

  return objectLabel.toLowerCase();
};
