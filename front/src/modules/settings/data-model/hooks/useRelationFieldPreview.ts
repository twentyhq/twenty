import { useObjectMainIdentifier } from '@/object-metadata/hooks/useObjectMainIdentifier';
import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';

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

  const {
    labelIdentifierFieldPaths,
    imageIdentifierUrlField,
    imageIdentifierUrlPrefix,
    imageIdentifierFormat,
  } = useObjectMainIdentifier(relationObjectMetadataItem);

  return {
    defaultValue: relationObjects?.[0],
    labelIdentifierFieldPaths,
    imageIdentifierUrlField,
    imageIdentifierUrlPrefix,
    imageIdentifierFormat,
  };
};
