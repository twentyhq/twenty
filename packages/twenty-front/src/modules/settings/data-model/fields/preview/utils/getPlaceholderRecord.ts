import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { getFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getFieldPreviewValue';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getPlaceholderRecord = ({
  objectMetadataItem,
}: {
  objectMetadataItem: Pick<ObjectMetadataItem, 'fields' | 'labelSingular'>;
}) => {
  const labelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  if (!labelIdentifierFieldMetadataItem) return null;

  const defaultFieldValue =
    labelIdentifierFieldMetadataItem.type === FieldMetadataType.Text
      ? objectMetadataItem.labelSingular
      : getFieldPreviewValue({
          fieldMetadataItem: labelIdentifierFieldMetadataItem,
        });

  const placeholderRecord = {
    [labelIdentifierFieldMetadataItem.name]: defaultFieldValue,
  };

  return placeholderRecord;
};
