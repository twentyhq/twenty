import { type MetadataOperation } from '@/browser-event/types/MetadataOperation';
import { type AllMetadataName } from 'twenty-shared/metadata';

export type MetadataOperationBrowserEventDetail<
  T extends Record<string, unknown>,
> = {
  metadataName: AllMetadataName;
  operation: MetadataOperation<T>;
};
