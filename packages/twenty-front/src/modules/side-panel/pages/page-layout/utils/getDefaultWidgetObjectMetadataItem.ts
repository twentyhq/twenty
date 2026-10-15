import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const getDefaultWidgetObjectMetadataItem = (
  objectMetadataItems: EnrichedObjectMetadataItem[],
) =>
  objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === CoreObjectNameSingular.Company,
  ) ||
  [...objectMetadataItems].sort((first, second) =>
    first.labelPlural.localeCompare(second.labelPlural),
  )[0];
