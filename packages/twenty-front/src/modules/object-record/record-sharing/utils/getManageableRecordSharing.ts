import { isDefined } from 'twenty-shared/utils';

import { type RecordSharingFieldsFragment } from '~/generated-metadata/graphql';

export const getManageableRecordSharing = (
  recordSharing: RecordSharingFieldsFragment | undefined,
): RecordSharingFieldsFragment | undefined => {
  if (!isDefined(recordSharing)) {
    return undefined;
  }

  return {
    ...recordSharing,
    canManageSharing:
      recordSharing.isShareable && recordSharing.canManageSharing,
  };
};
