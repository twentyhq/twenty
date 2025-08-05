import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useGetObjectPermissionDerivedStates = ({
  roleId,
}: {
  roleId: string;
}) => {
  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const getObjectPermissionDerivedStates = (objectMetadataItemId: string) => {
    const objectPermission = settingsDraftRole.objectPermissions?.find(
      (objectPermissionToFind) =>
        objectPermissionToFind.objectMetadataId === objectMetadataItemId,
    );

    const isObjectPermissionDefined = isDefined(objectPermission);

    const objectPermissionHasOnlyNullPermissions =
      isObjectPermissionDefined &&
      !isDefined(objectPermission.canReadObjectRecords) &&
      !isDefined(objectPermission.canUpdateObjectRecords) &&
      !isDefined(objectPermission.canSoftDeleteObjectRecords) &&
      !isDefined(objectPermission.canDestroyObjectRecords);

    const readIsRestrictedOnAllObjectsByDefault =
      settingsDraftRole.canReadAllObjectRecords === false;

    const updateIsRestrictedOnAllObjectsByDefault =
      settingsDraftRole.canUpdateAllObjectRecords === false;

    const deleteIsRestrictedOnAllObjectsByDefault =
      settingsDraftRole.canSoftDeleteAllObjectRecords === false;

    const destroyIsRestrictedOnAllObjectsByDefault =
      settingsDraftRole.canDestroyAllObjectRecords === false;

    const readIsAllowedOnAllObjectsByDefault =
      settingsDraftRole.canReadAllObjectRecords === true;

    const updateIsAllowedOnAllObjectsByDefault =
      settingsDraftRole.canUpdateAllObjectRecords === true;

    const deleteIsAllowedOnAllObjectsByDefault =
      settingsDraftRole.canSoftDeleteAllObjectRecords === true;

    const destroyIsAllowedOnAllObjectsByDefault =
      settingsDraftRole.canDestroyAllObjectRecords === true;

    const objectHasReadGranted =
      readIsRestrictedOnAllObjectsByDefault &&
      isObjectPermissionDefined &&
      objectPermission.canReadObjectRecords === true;

    const objectHasReadRevoked =
      readIsAllowedOnAllObjectsByDefault &&
      isObjectPermissionDefined &&
      objectPermission.canReadObjectRecords === false;

    const objectHasNoOverrideOnRead =
      !isObjectPermissionDefined ||
      (!objectHasReadGranted && !objectHasReadRevoked);

    const objectHasUpdateGranted =
      updateIsRestrictedOnAllObjectsByDefault &&
      isObjectPermissionDefined &&
      objectPermission.canUpdateObjectRecords === true;

    const objectHasUpdateRevoked =
      updateIsAllowedOnAllObjectsByDefault &&
      isObjectPermissionDefined &&
      objectPermission.canUpdateObjectRecords === false;

    const objectHasNoOverrideOnUpdate =
      !isObjectPermissionDefined ||
      (!objectHasUpdateGranted && !objectHasUpdateRevoked);

    const objectHasDeleteGranted =
      deleteIsRestrictedOnAllObjectsByDefault &&
      isObjectPermissionDefined &&
      objectPermission.canSoftDeleteObjectRecords === true;

    const objectHasDeleteRevoked =
      deleteIsAllowedOnAllObjectsByDefault &&
      isObjectPermissionDefined &&
      objectPermission.canSoftDeleteObjectRecords === false;

    const objectHasNoOverrideOnDelete =
      !isObjectPermissionDefined ||
      (!objectHasDeleteGranted && !objectHasDeleteRevoked);

    const objectHasDestroyGranted =
      destroyIsRestrictedOnAllObjectsByDefault &&
      isObjectPermissionDefined &&
      objectPermission.canDestroyObjectRecords === true;

    const objectHasDestroyRevoked =
      destroyIsAllowedOnAllObjectsByDefault &&
      isObjectPermissionDefined &&
      objectPermission.canDestroyObjectRecords === false;

    const objectHasNoOverrideOnDestroy =
      !isObjectPermissionDefined ||
      (!objectHasDestroyGranted && !objectHasDestroyRevoked);

    const objectHasNoOverrideOnObjectPermission =
      objectHasNoOverrideOnRead &&
      objectHasNoOverrideOnUpdate &&
      objectHasNoOverrideOnDelete &&
      objectHasNoOverrideOnDestroy;

    const objectReadIsRestricted =
      (readIsRestrictedOnAllObjectsByDefault && objectHasNoOverrideOnRead) ||
      objectHasReadRevoked;

    const objectUpdateIsRestricted =
      (updateIsRestrictedOnAllObjectsByDefault &&
        objectHasNoOverrideOnUpdate) ||
      objectHasUpdateRevoked;

    const cannotAllowFieldUpdateRestrict =
      objectReadIsRestricted || objectUpdateIsRestricted;

    const cannotAllowFieldReadRestrict = objectReadIsRestricted;

    const canRestrictFieldRead = !cannotAllowFieldReadRestrict;
    const canRestrictFieldUpdate = !cannotAllowFieldUpdateRestrict;

    const fieldPermissionsForThisObject =
      settingsDraftRole.fieldPermissions?.filter(
        (fieldPermissionToFilter) =>
          fieldPermissionToFilter.objectMetadataId === objectMetadataItemId,
      );

    const fieldPermissionsThatRevokeRead =
      fieldPermissionsForThisObject?.filter(
        (fieldPermissionToFilter) =>
          fieldPermissionToFilter.canReadFieldValue === false,
      ) ?? [];

    const fieldPermissionsThatRevokeUpdate =
      fieldPermissionsForThisObject?.filter(
        (fieldPermissionToFilter) =>
          fieldPermissionToFilter.canUpdateFieldValue === false,
      ) ?? [];

    const isThereAnyFieldPermissionThatRevokeRead =
      fieldPermissionsThatRevokeRead.length > 0;
    const isThereAnyFieldPermissionThatRevokeUpdate =
      fieldPermissionsThatRevokeUpdate.length > 0;

    const thereAreFieldPermissionsButTheyShouldntBeTakenIntoAccountBecauseObjectPermissionsDontAllowIt =
      isThereAnyFieldPermissionThatRevokeRead &&
      cannotAllowFieldReadRestrict &&
      isThereAnyFieldPermissionThatRevokeUpdate &&
      cannotAllowFieldUpdateRestrict;

    const objectHasNoOverrideButFieldPermissionsShouldBeTakenIntoAccount =
      objectHasNoOverrideOnObjectPermission &&
      ((isThereAnyFieldPermissionThatRevokeRead && canRestrictFieldRead) ||
        (isThereAnyFieldPermissionThatRevokeUpdate && canRestrictFieldUpdate));

    const objectHasOverrideOnObjectPermissions =
      !objectHasNoOverrideOnObjectPermission;

    return {
      objectReadIsRestricted,
      objectUpdateIsRestricted,
      cannotAllowFieldUpdateRestrict,
      cannotAllowFieldReadRestrict,
      objectHasReadRevoked,
      objectHasUpdateRevoked,
      objectHasDeleteRevoked,
      objectHasDestroyRevoked,
      objectHasReadGranted,
      objectHasUpdateGranted,
      objectHasDeleteGranted,
      objectHasDestroyGranted,
      objectHasNoOverrideOnObjectPermission,
      thereAreFieldPermissionsButTheyShouldntBeTakenIntoAccountBecauseObjectPermissionsDontAllowIt,
      objectHasNoOverrideButFieldPermissionsShouldBeTakenIntoAccount,
      objectPermissionHasOnlyNullPermissions,
      objectHasOverrideOnObjectPermissions,
    };
  };

  return {
    getObjectPermissionDerivedStates,
  };
};
