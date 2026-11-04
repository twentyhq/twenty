import { type ObjectRecordsPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectRecordsPermissionsWithObjectMetadataId';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { getTargetObjectMetadataIdsFromField } from '@/object-record/record-field/ui/utils/junction/getTargetObjectMetadataIdsFromField';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { type JunctionObjectMetadataItem } from '@/object-record/record-field/ui/utils/junction/types/JunctionObjectMetadataItem';
import { resolveJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveJunctionConfig';
import { isDefined } from 'twenty-shared/utils';

type ObjectPermissionsByObjectMetadataId = Record<
  string,
  ObjectRecordsPermissionsWithObjectMetadataId
>;

export const isJunctionRelationForbidden = ({
  fieldMetadataItem,
  sourceObjectMetadataId,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
}: {
  fieldMetadataItem: Pick<FieldMetadataItem, 'settings' | 'relation'>;
  sourceObjectMetadataId: string;
  objectMetadataItems: JunctionObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId;
}): boolean => {
  const junctionObjectMetadataId =
    fieldMetadataItem.relation?.targetObjectMetadata.id;

  if (!isDefined(junctionObjectMetadataId)) {
    return false;
  }

  const junctionConfig = resolveJunctionConfig({
    settings: fieldMetadataItem.settings,
    relationObjectMetadataId: junctionObjectMetadataId,
    relationTargetFieldMetadataId:
      fieldMetadataItem.relation?.targetFieldMetadata.id,
    sourceObjectMetadataId,
    objectMetadataItems,
  });

  if (!isDefined(junctionConfig)) {
    return false;
  }

  if (!isUsableJunctionConfig(junctionConfig)) {
    return true;
  }

  const junctionPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    junctionObjectMetadataId,
  );

  if (!junctionPermissions.canReadSomeRecords) {
    return true;
  }

  const targetObjectMetadataIds = junctionConfig.targetFields.flatMap(
    getTargetObjectMetadataIdsFromField,
  );

  if (targetObjectMetadataIds.length === 0) {
    return false;
  }

  return !targetObjectMetadataIds.some(
    (targetId) =>
      getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        targetId,
      ).canReadSomeRecords,
  );
};
