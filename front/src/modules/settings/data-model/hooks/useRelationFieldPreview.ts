import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';
import { capitalize } from '~/utils/string/capitalize';

export const useRelationFieldPreview = ({
  relationObjectMetadataId,
  skipDefaultValue,
}: {
  relationObjectMetadataId?: string;
  skipDefaultValue: boolean;
}) => {
  const { findObjectMetadataItemById } = useObjectMetadataItemForSettings();

  const relationObjectMetadataItem = relationObjectMetadataId
    ? findObjectMetadataItemById(relationObjectMetadataId)
    : undefined;

  const { objects: relationObjects } = useFindManyObjectRecords({
    objectNamePlural: relationObjectMetadataItem?.namePlural,
    skip: skipDefaultValue || !relationObjectMetadataItem,
  });

  const mockValueName = capitalize(
    relationObjectMetadataItem?.nameSingular ?? '',
  );

  return {
    relationObjectMetadataItem,
    defaultValue: relationObjects?.[0] ?? {
      company: { name: mockValueName }, // Temporary mock for opportunities, this needs to be replaced once labelIdentifiers are implemented
      name: mockValueName,
    },
  };
};
