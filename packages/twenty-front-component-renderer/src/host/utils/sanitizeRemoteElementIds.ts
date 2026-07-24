import { isArray, isNonEmptyString } from '@sniptt/guards';

import { MAX_OBSERVED_GEOMETRY_ELEMENTS } from '@/constants/MaxObservedGeometryElements';
import { MAX_REMOTE_ELEMENT_ID_LENGTH } from '@/host/constants/MaxRemoteElementIdLength';

export const sanitizeRemoteElementIds = (
  remoteElementIds: unknown,
  maximumCount: number = MAX_OBSERVED_GEOMETRY_ELEMENTS,
): string[] => {
  if (!isArray(remoteElementIds)) {
    return [];
  }

  return remoteElementIds
    .slice(0, maximumCount)
    .filter(
      (remoteElementId): remoteElementId is string =>
        isNonEmptyString(remoteElementId) &&
        remoteElementId.length <= MAX_REMOTE_ELEMENT_ID_LENGTH,
    );
};
