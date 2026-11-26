import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type SearchResultItem } from '@/side-panel/pages/search/types/SearchResultItem';

export type SearchResultItemGroup = {
  objectNameSingular: string;
  objectLabelPlural: string;
  objectMetadataItem?: EnrichedObjectMetadataItem;
  searchResultItems: SearchResultItem[];
};
