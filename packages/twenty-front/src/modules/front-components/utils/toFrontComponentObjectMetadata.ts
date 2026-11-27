import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FrontComponentObjectMetadata } from 'twenty-sdk/front-component';

export const toFrontComponentObjectMetadata = (
  objectMetadata: EnrichedObjectMetadataItem,
): FrontComponentObjectMetadata => ({
  id: objectMetadata.id,
  nameSingular: objectMetadata.nameSingular,
  namePlural: objectMetadata.namePlural,
  labelSingular: objectMetadata.labelSingular,
  labelPlural: objectMetadata.labelPlural,
  fields: objectMetadata.fields.map(({ id, name, label, type, options }) => ({
    id,
    name,
    label,
    type,
    options:
      options?.map(({ value, label, color, position }) => ({
        value,
        label,
        color,
        position,
      })) ?? null,
  })),
});
