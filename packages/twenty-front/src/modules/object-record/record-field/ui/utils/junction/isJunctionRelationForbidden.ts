import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { getTargetObjectMetadataIdsFromField } from '@/object-record/record-field/ui/utils/junction/getTargetObjectMetadataIdsFromField';
import { hasJunctionConfig } from '@/object-record/record-field/ui/utils/junction/hasJunctionConfig';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type JunctionObjectMetadataItem } from './getJunctionConfig';

type ObjectPermissionsByObjectMetadataId = Record<
  string,
  ObjectPermissions & { objectMetadataId: string }
>;

// Returns true if a junction field's intermediate or final target object
// is not readable by the current user.
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
  if (!hasJunctionConfig(fieldMetadataItem.settings)) {
    return false;
  }

  const junctionObjectMetadataId =
    fieldMetadataItem.relation?.targetObjectMetadata.id;

  if (!isDefined(junctionObjectMetadataId)) {
    return false;
  }

  const junctionPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    junctionObjectMetadataId,
  );

  if (!junctionPermissions.canReadObjectRecords) {
    return true;
  }

  const junctionConfig = getJunctionConfig({
    settings: fieldMetadataItem.settings,
    relationObjectMetadataId: junctionObjectMetadataId,
    sourceObjectMetadataId,
    objectMetadataItems,
  });

  if (!isDefined(junctionConfig)) {
    return false;
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
      ).canReadObjectRecords,
  );
};
