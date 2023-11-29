import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';

export const useRelationFieldPreviewValue = ({
  relationObjectMetadataId,
  skip,
}: {
  relationObjectMetadataId?: string;
  skip?: boolean;
}) => {
  const { findObjectMetadataItemById } = useObjectMetadataItemForSettings();

  const relationObjectMetadataItem = relationObjectMetadataId
    ? findObjectMetadataItemById(relationObjectMetadataId)
    : undefined;

  const { objects: relationObjects } = useFindManyObjectRecords({
    objectNamePlural: relationObjectMetadataItem?.namePlural,
    skip: skip || !relationObjectMetadataItem,
  });

  const label = relationObjectMetadataItem?.labelSingular ?? '';

  return {
    relationObjectMetadataItem,
    value: relationObjects?.[0] ?? {
      company: { name: label }, // Temporary mock for opportunities, this needs to be replaced once labelIdentifiers are implemented
      name: label,
    },
  };
};
