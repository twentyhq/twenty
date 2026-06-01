import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { isWorkspaceCustomApplication } from '@/applications/utils/isWorkspaceCustomApplication';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useIsThirdPartyApplication = (
  applicationId?: string | null,
): boolean => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  if (!isDefined(applicationId)) {
    return false;
  }

  const application = currentWorkspace?.installedApplications.find(
    (app) => app.id === applicationId,
  );

  return (
    isDefined(application) &&
    !isTwentyStandardApplication(application) &&
    !isWorkspaceCustomApplication(application, currentWorkspace)
  );
};
