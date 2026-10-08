import { isDefined } from 'twenty-shared/utils';

import { type RecordPermissionsDto } from '~/generated-metadata/graphql';

type GetAiChatThreadAccessParams = {
  isOnNewAiChatSlot: boolean;
  permissions: RecordPermissionsDto | undefined;
};

export const getAiChatThreadAccess = ({
  isOnNewAiChatSlot,
  permissions,
}: GetAiChatThreadAccessParams) => {
  if (isOnNewAiChatSlot) {
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
