import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { isFieldValueEmpty } from '@/object-record/record-field/utils/isFieldValueEmpty';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getFieldPreviewValue';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';
import { pascalCase } from '~/utils/string/pascalCase';

type UsePreviewRecordParams = {
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    | 'fields'
    | 'labelIdentifierFieldMetadataId'
    | 'labelSingular'
    | 'nameSingular'
  >;
  skip?: boolean;
};

export const usePreviewRecord = ({
  objectMetadataItem,
  skip: skipFromProps,
}: UsePreviewRecordParams): ObjectRecord | null => {
  const labelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);
  const skip = skipFromProps || !labelIdentifierFieldMetadataItem;

  const { records } = useFindManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    limit: 1,
    skip,
  });

  if (skip) return null;

  const [firstRecord] = records;

  if (
    isDefined(firstRecord) &&
    !isFieldValueEmpty({
      fieldDefinition: { type: labelIdentifierFieldMetadataItem.type },
      fieldValue: firstRecord?.[labelIdentifierFieldMetadataItem.name],
    })
  ) {
    return firstRecord;
  }

  const fieldPreviewValue =
    labelIdentifierFieldMetadataItem.type === FieldMetadataType.Text
      ? objectMetadataItem.labelSingular
      : getFieldPreviewValue({
          fieldMetadataItem: labelIdentifierFieldMetadataItem,
        });

  const placeholderRecord = {
    __typename: pascalCase(objectMetadataItem.nameSingular),
    id: '',
    [labelIdentifierFieldMetadataItem.name]: fieldPreviewValue,
  };

  // If no record was found, or if the label identifier field value is empty, display a placeholder record
  return placeholderRecord;
};
