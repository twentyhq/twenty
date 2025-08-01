import { ObjectPermission } from '~/generated/graphql';

export const isObjectReadOnly = ({
  objectPermissions,
}: {
  objectPermissions: ObjectPermission;
}) => {
  return !objectPermissions.canUpdateObjectRecords;
};
