import { isDefined } from 'twenty-shared/utils';

import { type ApplicationTargetAccess } from 'src/engine/core-modules/application/types/application-target-access.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getScopedCallingApplication } from 'src/engine/core-modules/application/utils/get-scoped-calling-application.util';
import { isWorkspaceComposerApplication } from 'src/engine/core-modules/application/utils/is-workspace-composer-application.util';

type CallerAccess =
  | { access: 'manage'; workspaceCustomApplicationId?: never }
  | {
      access: Exclude<ApplicationTargetAccess, 'manage'>;
      workspaceCustomApplicationId: string | undefined;
    };

// Sessions and API keys keep workspace-wide reach behind their permission
// flags. An application token manages only its own application, and only the
// workspace composer also reads and triggers the others.
export const canCallerReachApplication = ({
  callingApplication,
  applicationId,
  access,
  workspaceCustomApplicationId,
}: {
  callingApplication:
    | Pick<FlatApplication, 'id' | 'universalIdentifier' | 'sourceType'>
    | null
    | undefined;
  applicationId: string | null | undefined;
} & CallerAccess): boolean => {
  const scopedCallingApplication =
    getScopedCallingApplication(callingApplication);

  if (
    !isDefined(scopedCallingApplication) ||
    applicationId === scopedCallingApplication.id
  ) {
    return true;
  }

  return (
    access !== 'manage' &&
    isWorkspaceComposerApplication({
      application: scopedCallingApplication,
      workspaceCustomApplicationId,
    })
  );
};
