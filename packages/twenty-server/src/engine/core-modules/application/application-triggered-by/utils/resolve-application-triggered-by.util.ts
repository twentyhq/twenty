import { isDefined } from 'twenty-shared/utils';

import { type ApplicationTriggeredBy } from 'src/engine/core-modules/auth/types/application-triggered-by.type';
import { buildApplicationTriggeredBy } from 'src/engine/core-modules/auth/utils/build-application-triggered-by.util';

// A token bound to a user is already scoped to that person, so it identifies
// the trigger just as well as the claim does.
export const resolveApplicationTriggeredBy = ({
  applicationTriggeredBy,
  tokenUserId,
  tokenUserWorkspaceId,
}: {
  applicationTriggeredBy?: ApplicationTriggeredBy;
  tokenUserId?: string;
  tokenUserWorkspaceId?: string;
}): ApplicationTriggeredBy | undefined =>
  isDefined(applicationTriggeredBy)
    ? applicationTriggeredBy
    : buildApplicationTriggeredBy({
        userId: tokenUserId,
        userWorkspaceId: tokenUserWorkspaceId,
      });
