import { isDefined } from 'twenty-shared/utils';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { type QueueJobScope } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const buildApplicationQueueJobScope = ({
  workspaceId,
  applicationId,
  flatApplicationMaps,
}: {
  workspaceId: string;
  applicationId: string | null | undefined;
  flatApplicationMaps: FlatApplicationCacheMaps;
}): QueueJobScope => {
  const applicationUniversalIdentifier = isDefined(applicationId)
    ? findActiveFlatApplicationById(flatApplicationMaps, applicationId)
        ?.universalIdentifier
    : undefined;

  return isDefined(applicationUniversalIdentifier)
    ? { workspaceId, applicationUniversalIdentifier }
    : { workspaceId, isWorkspaceJob: true };
};
