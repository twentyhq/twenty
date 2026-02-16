import { type MetadataOperation } from '@/object-metadata/types/MetadataOperation';

export type MetadataOperationBrowserEventDetail = {
  metadataName: string;
  operation: MetadataOperation;
};
