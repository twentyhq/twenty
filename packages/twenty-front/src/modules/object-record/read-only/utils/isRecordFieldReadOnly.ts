import {
  type IsFieldReadOnlyByPermissionParams,
  isFieldReadOnlyByPermissions,
} from '@/object-record/read-only/utils/internal/isFieldReadOnlyByPermissions';
import { isFieldReadOnlyBySystem } from '@/object-record/read-only/utils/internal/isFieldReadOnlyBySystem';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type IsRecordFieldReadOnlyParams = {
  isRecordReadOnly: boolean;
} & IsFieldReadOnlyByPermissionParams;

export const isRecordFieldReadOnly = ({
  isRecordReadOnly,
  objectPermissions,
  fieldMetadataId,
  fieldMetadataType,
  isUIReadOnly,
}: IsRecordFieldReadOnlyParams) => {
  if (fieldMetadataType === FieldMetadataType.RAW_JSON) {
    return false;
  }

  const fieldReadOnlyByPermissions = isFieldReadOnlyByPermissions({
    objectPermissions,
    fieldMetadataId,
    fieldMetadataType,
    isUIReadOnly,
  });

  const fieldReadOnlyBySystem = isFieldReadOnlyBySystem({
    isUIReadOnly,
  });

  return (
    isRecordReadOnly || fieldReadOnlyByPermissions || fieldReadOnlyBySystem
  );
};
