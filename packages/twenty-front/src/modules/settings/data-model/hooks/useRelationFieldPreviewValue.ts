import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

export const useRelationFieldPreviewValue = ({
  relationObjectMetadataId,
  skip,
}: {
  relationObjectMetadataId?: string;
  skip?: boolean;
}) => {
  const { findObjectMetadataItemById } = useObjectMetadataItemForSettings();

  // TODO: make this impossible to be undefined
  const relationObjectMetadataItem = relationObjectMetadataId
    ? findObjectMetadataItemById(relationObjectMetadataId)
    : undefined;

  const { records: relationObjects } = useFindManyRecords({
    objectNameSingular:
      relationObjectMetadataItem?.nameSingular ??
      CoreObjectNameSingular.Company, // TODO fix this hack
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
