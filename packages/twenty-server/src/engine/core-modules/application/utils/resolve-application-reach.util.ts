import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationReach } from 'src/engine/core-modules/application/types/application-reach.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getScopedCallingApplication } from 'src/engine/core-modules/application/utils/get-scoped-calling-application.util';

// The workspace custom application composes the workspace out of every
// application. The standard application shares that reach while it still
// runs the workspace's automated workflows.
export const resolveApplicationReach = ({
  callingApplication,
  workspaceCustomApplicationId,
}: {
  callingApplication:
    | Pick<FlatApplication, 'id' | 'universalIdentifier' | 'sourceType'>
    | null
    | undefined;
  workspaceCustomApplicationId: string | undefined;
}): ApplicationReach => {
  const scopedCallingApplication =
    getScopedCallingApplication(callingApplication);

  if (!isDefined(scopedCallingApplication)) {
    return 'workspace';
  }

  const isWorkspaceComposer =
    scopedCallingApplication.id === workspaceCustomApplicationId ||
    scopedCallingApplication.universalIdentifier ===
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER;

  return isWorkspaceComposer ? 'composer' : 'confined';
};
