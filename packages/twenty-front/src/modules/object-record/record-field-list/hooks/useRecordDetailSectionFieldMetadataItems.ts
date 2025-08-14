import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { isFieldCellSupported } from '@/object-record/utils/isFieldCellSupported';

type UseRecordDetailSectionFieldMetadataItems = {
  objectNameSingular: string;
  excludeFieldMetadataIds: string[];
};

export const useRecordDetailSectionFieldMetadataItems = ({
  objectNameSingular,
  excludeFieldMetadataIds,
}: UseRecordDetailSectionFieldMetadataItems) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const relationObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === objectNameSingular,
  );

  const fieldMetadataItems = relationObjectMetadataItem?.fields
    .filter(
      (fieldMetadataItem) =>
        isFieldCellSupported(fieldMetadataItem, objectMetadataItems) &&
        fieldMetadataItem.id !==
          relationObjectMetadataItem.labelIdentifierFieldMetadataId &&
        !excludeFieldMetadataIds.includes(fieldMetadataItem.id) &&
        fieldMetadataItem.name !== 'createdAt' &&
        fieldMetadataItem.name !== 'deletedAt',
    )
    .sort();

  return {
    fieldMetadataItems: fieldMetadataItems ?? [],
  };
};
