import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { FILES_SUB_FIELD_NAME_BY_FIELD_TYPE } from 'src/engine/core-modules/file/files-field/constants/files-sub-field-name-by-field-type.constant';

export const readFilesValue = ({
  record,
  field,
}: {
  record: Record<string, unknown> | null | undefined;
  field: { name: string; type: FieldMetadataType };
}): unknown => {
  const fieldValue = record?.[field.name];
  const filesSubFieldName = FILES_SUB_FIELD_NAME_BY_FIELD_TYPE[field.type];

  if (!isDefined(filesSubFieldName)) {
    return fieldValue;
  }

  return isPlainObject(fieldValue) ? fieldValue[filesSubFieldName] : undefined;
};
