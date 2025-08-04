import { ObjectPermission } from '~/generated/graphql';

type IsObjectReadOnlyParams = {
  objectPermissions: ObjectPermission;
  isRecordDeleted: boolean;
};

export const isRecordReadOnly = ({
  objectPermissions,
  isRecordDeleted,
}: IsObjectReadOnlyParams) => {
  return isRecordDeleted || !objectPermissions.canUpdateObjectRecords;
};
