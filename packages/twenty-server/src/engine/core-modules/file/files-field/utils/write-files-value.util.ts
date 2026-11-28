import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type FileInput } from 'src/engine/api/common/common-args-processors/data-arg-processor/types/file-item.type';
import { FILES_SUB_FIELD_NAME_BY_FIELD_TYPE } from 'src/engine/core-modules/file/files-field/constants/files-sub-field-name-by-field-type.constant';

export const writeFilesValue = ({
  fieldValue,
  field,
  filesValue,
}: {
  fieldValue: unknown;
  field: { type: FieldMetadataType };
  filesValue: FileInput[];
}): FileInput[] | Record<string, unknown> => {
  const filesSubFieldName = FILES_SUB_FIELD_NAME_BY_FIELD_TYPE[field.type];

  if (!isDefined(filesSubFieldName)) {
    return filesValue;
  }

  return {
    ...(isPlainObject(fieldValue) ? fieldValue : {}),
    [filesSubFieldName]: filesValue,
  };
};
