import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { FILES_SUB_FIELD_NAME_BY_FIELD_TYPE } from 'src/engine/core-modules/file/files-field/constants/files-sub-field-name-by-field-type.constant';

export const writeFilesValue = <TRecord extends Record<string, unknown>>({
  record,
  field,
  filesValue,
}: {
  record: TRecord;
  field: { name: string; type: FieldMetadataType };
  filesValue: unknown;
}): TRecord => {
  const filesSubFieldName = FILES_SUB_FIELD_NAME_BY_FIELD_TYPE[field.type];

  if (!isDefined(filesSubFieldName)) {
    return { ...record, [field.name]: filesValue };
  }

  const fieldValue = record[field.name];

  return {
    ...record,
    [field.name]: {
      ...(isPlainObject(fieldValue) ? fieldValue : {}),
      [filesSubFieldName]: filesValue,
    },
  };
};
