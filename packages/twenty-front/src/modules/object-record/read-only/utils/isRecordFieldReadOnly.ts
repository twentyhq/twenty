import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldMetadataReadOnlyByPermissions } from '@/object-record/read-only/utils/internal/isFieldMetadataReadOnlyByPermissions';
import { isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission } from '@/object-record/read-only/utils/isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission';
import { isConfiguredJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isConfiguredJunctionRelationField';
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
  isFieldFromStandardApplication?: boolean;
  fieldMetadataItem: Pick<FieldMetadataItem, 'id' | 'isUIEditable'> &
    Partial<Pick<FieldMetadataItem, 'type' | 'settings'>>;
  objectPermissions: ObjectPermission;
  fieldDefinition?: FieldDefinition<FieldMetadata>;
  objectPermissionsByObjectMetadataId?: ObjectPermissionsByObjectMetadataId;
};

export const isRecordFieldReadOnly = ({
  objectPermissions,
  isRecordReadOnly,
  isSystemObject,
  isFieldFromStandardApplication,
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

  // A junction target field carries links the workspace owns, not data synced
  // from the provider, so it stays editable on otherwise read-only records like
  // calendar events and message threads.
  const isJunctionTargetField =
    isDefined(fieldMetadataItem.type) &&
    isConfiguredJunctionRelationField({
      type: fieldMetadataItem.type,
      settings: fieldMetadataItem.settings,
    });

  // Keep system-object standard fields read-only. If the application origin
  // cannot be resolved yet, fail closed until metadata finishes loading.
  const isReadOnlyStandardFieldOnSystemObject =
    isSystemObject === true &&
    isFieldFromStandardApplication !== false &&
    !isJunctionTargetField;

  return (
    isRecordReadOnly ||
    isReadOnlyStandardFieldOnSystemObject ||
    !(fieldMetadataItem.isUIEditable ?? true) ||
    fieldReadOnlyByPermissions ||
    oneToManyTargetReadOnly
  );
};
