import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { capitalize } from 'twenty-shared/utils';

export const getCombinedFindManyRecordsQueryFilteringPart = (
  objectMetadataItem: EnrichedObjectMetadataItem,
) => {
  return `${objectMetadataItem.namePlural}(
  filter: $filter${capitalize(objectMetadataItem.nameSingular)},
  orderBy: $orderBy${capitalize(objectMetadataItem.nameSingular)},
  after: $after${capitalize(objectMetadataItem.nameSingular)},
  before: $before${capitalize(objectMetadataItem.nameSingular)},
  first: $first${capitalize(objectMetadataItem.nameSingular)},
  last: $last${capitalize(objectMetadataItem.nameSingular)})`;
};
