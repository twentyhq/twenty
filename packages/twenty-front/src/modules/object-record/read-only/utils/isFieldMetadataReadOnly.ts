import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isFieldMetadataReadOnlyByPermissions } from '@/object-record/read-only/utils/internal/isFieldMetadataReadOnlyByPermissions';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { type ObjectPermission } from '~/generated/graphql';

type IsFieldMetadataReadOnlyParams = {
  objectPermissions: ObjectPermission;
  objectMetadataItem: Pick<ObjectMetadataItem, 'isUIReadOnly' | 'isRemote'>;
  fieldMetadataItem: Pick<FieldMetadataItem, 'id' | 'isUIReadOnly'>;
};

export const isFieldMetadataReadOnly = ({
  objectPermissions,
  objectMetadataItem,
  fieldMetadataItem,
}: IsFieldMetadataReadOnlyParams) => {
  const objectMetadataReadOnly = isObjectMetadataReadOnly({
    objectPermissions,
    objectMetadataItem,
  });

  const fieldReadOnlyByPermissions = isFieldMetadataReadOnlyByPermissions({
    objectPermissions,
    fieldMetadataId: fieldMetadataItem.id,
  });

  return (
    objectMetadataReadOnly ||
    fieldMetadataItem.isUIReadOnly ||
    fieldReadOnlyByPermissions
  );
};
