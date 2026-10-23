import { type ApplicationTargetAccess } from 'src/engine/core-modules/application/types/application-target-access.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { resolveApplicationReach } from 'src/engine/core-modules/application/utils/resolve-application-reach.util';

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
  const reach = resolveApplicationReach({
    callingApplication,
    workspaceCustomApplicationId,
  });

  if (reach === 'workspace' || applicationId === callingApplication?.id) {
    return true;
  }

  return reach === 'composer' && access !== 'manage';
};
