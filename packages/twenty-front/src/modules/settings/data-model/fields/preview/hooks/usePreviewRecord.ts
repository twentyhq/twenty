import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getFieldPreviewValue';
import { isDefined } from 'twenty-shared/utils';
import { pascalCase } from '~/utils/string/pascalCase';

type UsePreviewRecordParams = {
  objectNameSingular: string;
  skip?: boolean;
};

export const usePreviewRecord = ({
  objectNameSingular,
  skip: skipFromProps,
}: UsePreviewRecordParams): ObjectRecord | null => {
  const { labelIdentifierFieldMetadataItem } =
    useLabelIdentifierFieldMetadataItem({
      objectNameSingular,
    });

  const skip = skipFromProps || !labelIdentifierFieldMetadataItem;

  let recordGqlFields: Record<string, boolean> | undefined = undefined;
  if (objectNameSingular === CoreObjectNameSingular.NoteTarget)
    recordGqlFields = { id: true, note: true };
  if (objectNameSingular === CoreObjectNameSingular.TaskTarget)
    recordGqlFields = { id: true, task: true };

  const { records } = useFindManyRecords({
    objectNameSingular,
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

  const fieldPreviewValue = getFieldPreviewValue({
    fieldType: labelIdentifierFieldMetadataItem.type,
    fieldSettings: labelIdentifierFieldMetadataItem.settings,
    defaultValue: labelIdentifierFieldMetadataItem.defaultValue,
  });

  const placeholderRecord = {
    __typename: pascalCase(objectNameSingular),
    id: '',
    [labelIdentifierFieldMetadataItem.name]: fieldPreviewValue,
  };

  // If no record was found, or if the label identifier field value is empty, display a placeholder record
  return placeholderRecord;
};
