import { type MetadataOperation } from '@/object-metadata/types/MetadataOperation';
import { type AllMetadataName } from 'twenty-shared/metadata';

export type MetadataOperationBrowserEventDetail<
  T extends Record<string, unknown>,
> = {
  metadataName: AllMetadataName;
  operation: MetadataOperation<T>;
};
