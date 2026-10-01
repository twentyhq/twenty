import { isThirdPartyApplication } from '@/applications/utils/isThirdPartyApplication';
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

  return isThirdPartyApplication({ application, currentWorkspace });
};
