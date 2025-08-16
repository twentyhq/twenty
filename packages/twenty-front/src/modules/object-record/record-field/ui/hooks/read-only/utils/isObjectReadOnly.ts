import { type ObjectPermission } from '~/generated/graphql';

type IsObjectReadOnlyParams = {
  objectPermissions: ObjectPermission;
  isUIReadOnly: boolean;
};

export const isObjectReadOnly = ({
  objectPermissions,
  isUIReadOnly,
}: IsObjectReadOnlyParams) => {
  return !objectPermissions.canUpdateObjectRecords || isUIReadOnly;
};
