import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldCellSupported } from '@/object-record/utils/isFieldCellSupported';
import { FieldMetadataType } from 'twenty-shared/types';

type UseFieldsWidgetFieldMetadataItemsProps = {
  objectNameSingular: string;
};

export const useFieldsWidgetFieldMetadataItems = ({
  objectNameSingular,
}: UseFieldsWidgetFieldMetadataItemsProps): FieldMetadataItem[] => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const fieldMetadataItems = objectMetadataItem.readableFields.filter(
    (fieldMetadataItem) =>
      isFieldCellSupported(fieldMetadataItem, objectMetadataItems) &&
      fieldMetadataItem.type !== FieldMetadataType.RELATION &&
      fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION &&
      fieldMetadataItem.type !== FieldMetadataType.RICH_TEXT_V2,
  );

  return fieldMetadataItems;
};
