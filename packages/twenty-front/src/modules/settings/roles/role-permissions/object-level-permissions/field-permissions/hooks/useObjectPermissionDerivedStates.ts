import { useGetObjectPermissionDerivedStates } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useGetObjectPermissionDerivedStates';

export const useObjectPermissionDerivedStates = ({
  roleId,
  objectMetadataItemId,
}: {
  roleId: string;
  objectMetadataItemId: string;
}) => {
  const { getObjectPermissionDerivedStates } =
    useGetObjectPermissionDerivedStates({
      roleId,
    });

  const {
    objectReadIsRestricted,
    objectUpdateIsRestricted,
    cannotAllowUpdateRestrict,
    cannotAllowReadRestrict,
    objectHasUpdateGranted,
    objectHasUpdateRevoked,
    objectHasReadGranted,
    objectHasReadRevoked,
    objectHasNoOverrideOnObjectPermission,
    thereAreFieldPermissionsButTheyShouldntBeTakenIntoAccountBecauseObjectPermissionsDontAllowIt,
  } = getObjectPermissionDerivedStates(objectMetadataItemId);

  return {
    objectReadIsRestricted,
    objectUpdateIsRestricted,
    cannotAllowUpdateRestrict,
    cannotAllowReadRestrict,
    objectHasUpdateGranted,
    objectHasUpdateRevoked,
    objectHasReadGranted,
    objectHasReadRevoked,
    objectHasNoOverrideOnObjectPermission,
    thereAreFieldPermissionsButTheyShouldntBeTakenIntoAccountBecauseObjectPermissionsDontAllowIt,
  };
};
