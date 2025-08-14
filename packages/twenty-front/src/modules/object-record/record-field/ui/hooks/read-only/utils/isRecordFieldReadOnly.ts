import {
  isFieldReadOnlyByPermissions,
  type IsFieldReadOnlyByPermissionParams,
} from '@/object-record/record-field/ui/hooks/read-only/utils/internal/isFieldReadOnlyByPermissions';
import { isFieldReadOnlyBySystem } from '@/object-record/record-field/ui/hooks/read-only/utils/internal/isFieldReadOnlyBySystem';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type IsRecordFieldReadOnlyParams = {
  isRecordReadOnly: boolean;
} & IsFieldReadOnlyByPermissionParams;

export const isRecordFieldReadOnly = ({
  isRecordReadOnly,
  objectPermissions,
  objectMetadataItem,
  fieldMetadataItem,
}: IsRecordFieldReadOnlyParams) => {
  if (fieldMetadataItem.type === FieldMetadataType.RAW_JSON) {
    return false;
  }

  const fieldReadOnlyByPermissions = isFieldReadOnlyByPermissions({
    objectPermissions,
    objectMetadataItem,
    fieldMetadataItem,
  });

  const fieldReadOnlyBySystem = isFieldReadOnlyBySystem({
    objectNameSingular: objectMetadataItem.nameSingular,
    fieldName: fieldMetadataItem.name,
    fieldType: fieldMetadataItem.type,
    isCustom: fieldMetadataItem.isCustom ?? false,
    isUIReadOnly: fieldMetadataItem.isUIReadOnly ?? false,
  });

  return (
    isRecordReadOnly || fieldReadOnlyByPermissions || fieldReadOnlyBySystem
  );
};
