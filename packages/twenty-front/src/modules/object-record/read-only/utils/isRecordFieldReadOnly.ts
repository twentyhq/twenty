import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectPermissionsByObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsByObjectMetadataId';
import { getFieldPermissions } from '@/object-metadata/utils/getFieldPermissions';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { isMetadataWritabilityRestricted } from '@/object-record/read-only/utils/internal/isMetadataWritabilityRestricted';
import { isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission } from '@/object-record/read-only/utils/isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isDefined } from 'twenty-shared/utils';

type IsRecordFieldReadOnlyParams = {
  isRecordReadOnly: boolean;
  objectMetadataId: string;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'id' | 'isUIEditable' | 'writability'
  >;
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId;
  fieldDefinition?: FieldDefinition<FieldMetadata>;
};

export const isRecordFieldReadOnly = ({
  isRecordReadOnly,
  objectMetadataId,
  fieldMetadataItem,
  objectPermissionsByObjectMetadataId,
  fieldDefinition,
}: IsRecordFieldReadOnlyParams) => {
  if (
    isRecordReadOnly ||
    !(fieldMetadataItem.isUIEditable ?? true) ||
    isMetadataWritabilityRestricted(fieldMetadataItem.writability)
  ) {
    return true;
  }

  const objectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    objectMetadataId,
  );

  if (
    !objectPermissions.canUpdateObjectRecords ||
    !getFieldPermissions({
      objectPermissions,
      fieldMetadataId: fieldMetadataItem.id,
    }).canUpdateField
  ) {
    return true;
  }

  return (
    isDefined(fieldDefinition) &&
    isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission({
      fieldDefinition,
      objectPermissionsByObjectMetadataId,
    })
  );
};
