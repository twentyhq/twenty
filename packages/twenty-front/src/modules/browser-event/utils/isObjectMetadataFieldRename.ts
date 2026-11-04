import { type MetadataOperation } from '@/browser-event/types/MetadataOperation';

export const isObjectMetadataFieldRename = <T extends Record<string, unknown>>(
  operation: MetadataOperation<T>,
): operation is Extract<MetadataOperation<T>, { type: 'update' }> =>
  operation.type === 'update' &&
  (operation.updatedFields?.includes('name') ?? false);
