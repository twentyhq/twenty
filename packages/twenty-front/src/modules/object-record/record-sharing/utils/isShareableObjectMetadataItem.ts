import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { MetadataReadability } from '~/generated-metadata/graphql';

const SHAREABLE_READABILITIES = [
  MetadataReadability.OPEN,
  MetadataReadability.PRIVATE,
  MetadataReadability.DISCOVERABLE,
  MetadataReadability.INHERITED,
];

// Mirrors the server: application and system data is never shared by record
export const isShareableObjectMetadataItem = (
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'isSystem' | 'readability'
  >,
): boolean =>
  !objectMetadataItem.isSystem &&
  SHAREABLE_READABILITIES.includes(objectMetadataItem.readability);
