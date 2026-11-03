import { type MetadataOperation } from '@/browser-event/types/MetadataOperation';
import { isString } from '@sniptt/guards';

export const getObjectMetadataIdWithStaleFieldName = (
  operation: MetadataOperation<Record<string, unknown>>,
): string | undefined => {
  const affectedRecord =
    operation.type === 'update' && operation.updatedFields?.includes('name')
      ? operation.updatedRecord
      : operation.type === 'delete'
        ? operation.deletedRecord
        : undefined;

  const objectMetadataId = affectedRecord?.objectMetadataId;

  return isString(objectMetadataId) ? objectMetadataId : undefined;
};
