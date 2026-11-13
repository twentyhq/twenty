import { isDefined } from 'twenty-shared/utils';

import { type RecordPermissionsDto } from '~/generated-metadata/graphql';

type GetInboxThreadAccessParams = {
  isOnNewInboxSlot: boolean;
  permissions: RecordPermissionsDto | undefined;
};

export const getInboxThreadAccess = ({
  isOnNewInboxSlot,
  permissions,
}: GetInboxThreadAccessParams) => {
  if (isOnNewInboxSlot) {
    return 'writer';
  }
  if (!isDefined(permissions?.canUpdate)) {
    return 'loading';
  }
  if (!permissions.canRead) {
    return 'unavailable';
  }
  return permissions.canUpdate ? 'writer' : 'viewer';
};
