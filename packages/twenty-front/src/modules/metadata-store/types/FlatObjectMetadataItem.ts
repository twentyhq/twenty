import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export type FlatObjectMetadataItem = Omit<
  ObjectMetadataItem,
  'fields' | 'readableFields' | 'updatableFields' | 'indexMetadatas'
>;
