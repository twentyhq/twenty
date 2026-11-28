import { type FieldMetadataType } from 'twenty-shared/types';

import { FILES_SUB_FIELD_NAME_BY_FIELD_TYPE } from 'src/engine/core-modules/file/files-field/constants/files-sub-field-name-by-field-type.constant';

export const isFieldHoldingFiles = ({
  type,
}: {
  type: FieldMetadataType;
}): boolean => FILES_SUB_FIELD_NAME_BY_FIELD_TYPE[type] !== undefined;
