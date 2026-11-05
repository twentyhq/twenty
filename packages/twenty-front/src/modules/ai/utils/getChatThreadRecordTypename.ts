import { isNonEmptyString } from '@sniptt/guards';

import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';

export const getChatThreadRecordTypename = ({
  objectNameSingular,
  currentRecordTypename,
  updateRecordTypename,
}: {
  objectNameSingular?: string;
  currentRecordTypename?: string;
  updateRecordTypename?: string;
}): string | undefined => {
  if (isNonEmptyString(objectNameSingular)) {
    return getObjectTypename(objectNameSingular);
  }

  if (isNonEmptyString(currentRecordTypename)) {
    return currentRecordTypename;
  }

  return isNonEmptyString(updateRecordTypename)
    ? updateRecordTypename
    : undefined;
};
