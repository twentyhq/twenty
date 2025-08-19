import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldMetadataReadOnlyByPermissions } from '@/object-record/read-only/utils/internal/isFieldMetadataReadOnlyByPermissions';
import { type ObjectPermission } from '~/generated/graphql';

type IsRecordFieldReadOnlyParams = {
  isRecordReadOnly: boolean;
  fieldMetadataItem: Pick<FieldMetadataItem, 'id' | 'isUIReadOnly'>;
  objectPermissions: ObjectPermission;
};

export const isRecordFieldReadOnly = ({
  objectPermissions,
  isRecordReadOnly,
  fieldMetadataItem,
}: IsRecordFieldReadOnlyParams) => {
  const fieldReadOnlyByPermissions = isFieldMetadataReadOnlyByPermissions({
    objectPermissions,
    fieldMetadataId: fieldMetadataItem.id,
  });

  return (
    isRecordReadOnly ||
    fieldMetadataItem.isUIReadOnly ||
    fieldReadOnlyByPermissions
  );
};
