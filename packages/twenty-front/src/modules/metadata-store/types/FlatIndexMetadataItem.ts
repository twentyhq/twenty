import { type IndexMetadataItem } from '@/object-metadata/types/IndexMetadataItem';

export type FlatIndexMetadataItem = IndexMetadataItem & {
  objectMetadataId: string;
};
