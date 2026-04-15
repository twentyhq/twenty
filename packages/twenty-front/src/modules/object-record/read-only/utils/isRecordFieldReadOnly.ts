import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldMetadataReadOnlyByPermissions } from '@/object-record/read-only/utils/internal/isFieldMetadataReadOnlyByPermissions';
import { isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission } from '@/object-record/read-only/utils/isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ObjectPermission } from '~/generated-metadata/graphql';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type ObjectPermissionsByObjectMetadataId = Record<
  string,
  ObjectPermissions & { objectMetadataId: string }
>;

type IsRecordFieldReadOnlyParams = {
  isRecordReadOnly: boolean;
  isSystemObject?: boolean;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'id' | 'isUIReadOnly' | 'isCustom'
  >;
  objectPermissions: ObjectPermission;
  fieldDefinition?: FieldDefinition<FieldMetadata>;
  objectPermissionsByObjectMetadataId?: ObjectPermissionsByObjectMetadataId;
};

export const isRecordFieldReadOnly = ({
  objectPermissions,
  isRecordReadOnly,
  isSystemObject,
  fieldMetadataItem,
  fieldDefinition,
  objectPermissionsByObjectMetadataId,
}: IsRecordFieldReadOnlyParams) => {
  const fieldReadOnlyByPermissions = isFieldMetadataReadOnlyByPermissions({
    objectPermissions,
    fieldMetadataId: fieldMetadataItem.id,
  });

  const oneToManyTargetReadOnly =
    isDefined(fieldDefinition) &&
    isDefined(objectPermissionsByObjectMetadataId) &&
    isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission({
      fieldDefinition,
      objectPermissionsByObjectMetadataId,
    });

  return (
    isRecordReadOnly ||
    (isSystemObject === true && fieldMetadataItem.isCustom !== true) ||
    fieldMetadataItem.isUIReadOnly ||
    fieldReadOnlyByPermissions ||
    oneToManyTargetReadOnly
  );
};
