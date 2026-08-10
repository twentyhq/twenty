import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

type GetValidSearchObjectNameSingularParams = {
  objectNameSingular: string | null;
  filterableObjectMetadataItems: EnrichedObjectMetadataItem[];
};

// The search page takes its object filter from the url, so it can name
// something unknown, hidden or unreadable. Anything the filter list does not
// offer is dropped rather than forwarded as a search scope.
export const getValidSearchObjectNameSingular = ({
  objectNameSingular,
  filterableObjectMetadataItems,
}: GetValidSearchObjectNameSingularParams): string | null =>
  filterableObjectMetadataItems.some(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === objectNameSingular,
  )
    ? objectNameSingular
    : null;
