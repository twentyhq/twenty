import { type VIEW_METADATA_ENTITY_KEYS } from '@/metadata-store/constants/ViewMetadataEntityKeys';
import { type MetadataEntityTypeMap } from '@/metadata-store/types/MetadataEntityTypeMap';

export type ViewMetadataSlice = {
  [
    TKey in (typeof VIEW_METADATA_ENTITY_KEYS)[number]
  ]: MetadataEntityTypeMap[TKey][];
};
