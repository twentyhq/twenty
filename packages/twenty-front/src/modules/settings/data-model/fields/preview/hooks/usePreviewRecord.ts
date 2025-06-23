import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { isFieldValueEmpty } from '@/object-record/record-field/utils/isFieldValueEmpty';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getFieldPreviewValue';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
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

  let recordGqlFields: Record<string, boolean> | undefined = undefined;
  if (objectMetadataItem.nameSingular === CoreObjectNameSingular.NoteTarget)
    recordGqlFields = { id: true, note: true };
  if (objectMetadataItem.nameSingular === CoreObjectNameSingular.TaskTarget)
    recordGqlFields = { id: true, task: true };

  const { records } = useFindManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFields,
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
    labelIdentifierFieldMetadataItem.type === FieldMetadataType.TEXT
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
