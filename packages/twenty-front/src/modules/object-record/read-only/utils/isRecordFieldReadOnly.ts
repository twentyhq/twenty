import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldMetadataReadOnlyByPermissions } from '@/object-record/read-only/utils/internal/isFieldMetadataReadOnlyByPermissions';
import { type ObjectPermission } from '~/generated-metadata/graphql';

type IsRecordFieldReadOnlyParams = {
  isRecordReadOnly: boolean;
  isSystemObject?: boolean;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'id' | 'isUIReadOnly' | 'isCustom'
  >;
  objectPermissions: ObjectPermission;
};

export const isRecordFieldReadOnly = ({
  objectPermissions,
  isRecordReadOnly,
  isSystemObject,
  fieldMetadataItem,
}: IsRecordFieldReadOnlyParams) => {
  const fieldReadOnlyByPermissions = isFieldMetadataReadOnlyByPermissions({
    objectPermissions,
    fieldMetadataId: fieldMetadataItem.id,
  });

  return (
    isRecordReadOnly ||
    (isSystemObject === true && fieldMetadataItem.isCustom !== true) ||
    fieldMetadataItem.isUIReadOnly ||
    fieldReadOnlyByPermissions
  );
};
