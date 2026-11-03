import { type MetadataOperation } from '@/browser-event/types/MetadataOperation';
import { isString } from '@sniptt/guards';

// Cached record queries embed field names in their filters, so a renamed or
// deleted field leaves them pointing at a name the metadata no longer has.
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
