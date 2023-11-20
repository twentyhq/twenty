import { useObjectMainIdentifier } from '@/object-metadata/hooks/useObjectMainIdentifier';
import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';
import { MainIdentifierMapper } from '@/ui/object/field/types/MainIdentifierMapper';

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

  const { mainIdentifierMapper } = useObjectMainIdentifier(
    relationObjectMetadataItem,
  );

  const recordMapper: MainIdentifierMapper | undefined =
    relationObjectMetadataItem && mainIdentifierMapper
      ? (record: { id: string }) => {
          const mappedRecord = mainIdentifierMapper(record);

          return {
            ...mappedRecord,
            name: mappedRecord.name || relationObjectMetadataItem.labelSingular,
          };
        }
      : undefined;

  return {
    defaultValue: relationObjects?.[0],
    recordMapper,
  };
};
