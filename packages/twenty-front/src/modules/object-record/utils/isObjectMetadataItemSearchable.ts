import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

const SEARCHABLE_STANDARD_OBJECTS_NAMES_PLURAL = [
  'companies',
  'people',
  'opportunities',
];
export const isObjectMetadataItemSearchable = (
  objectMetadataItem: ObjectMetadataItem,
) => {
  return (
    objectMetadataItem.isCustom ||
    SEARCHABLE_STANDARD_OBJECTS_NAMES_PLURAL.includes(
      objectMetadataItem.namePlural,
    )
  );
};
