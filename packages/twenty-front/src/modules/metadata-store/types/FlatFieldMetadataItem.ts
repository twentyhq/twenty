import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export type FlatFieldMetadataItem = FieldMetadataItem & {
  objectMetadataId: string;
};
