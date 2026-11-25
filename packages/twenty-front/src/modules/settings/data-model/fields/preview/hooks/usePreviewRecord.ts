import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import {
  StandardObjectNameSingular,
  type RecordGqlFields,
} from 'twenty-shared/types';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getFieldPreviewValue } from '@/settings/data-model/fields/preview/utils/getFieldPreviewValue';
import { isDefined, pascalCase } from 'twenty-shared/utils';

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

  let recordGqlFields: RecordGqlFields | undefined = undefined;
  if (objectNameSingular === StandardObjectNameSingular.NoteTarget) {
    recordGqlFields = { id: true, note: true };
  }
  if (objectNameSingular === StandardObjectNameSingular.TaskTarget) {
    recordGqlFields = { id: true, task: true };
  }

  const { records } = useFindManyRecords({
    objectNameSingular,
    recordGqlFields,
    limit: 1,
    skip,
  });

  if (skip) {
    return null;
  }

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

  return placeholderRecord;
};
