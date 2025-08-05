import { ObjectPermission } from '~/generated/graphql';

type IsObjectReadOnlyParams = {
  objectPermissions: ObjectPermission;
};

export const isObjectReadOnly = ({
  objectPermissions,
}: IsObjectReadOnlyParams) => {
  return !objectPermissions.canUpdateObjectRecords;
};
