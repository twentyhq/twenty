import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { isWorkspaceCustomApplication } from '@/applications/utils/isWorkspaceCustomApplication';
import { getCustomApplicationDescription } from '~/pages/settings/applications/utils/getCustomApplicationDescription';
import { getStandardApplicationDescription } from '~/pages/settings/applications/utils/getStandardApplicationDescription';

type ApplicationLike = {
  id?: string | null;
  universalIdentifier?: string | null;
  description?: string | null;
};

export const useResolvedApplicationDescription = (
  application: ApplicationLike | null | undefined,
): string => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  if (isTwentyStandardApplication(application)) {
    return getStandardApplicationDescription();
  }

  if (isWorkspaceCustomApplication(application, currentWorkspace)) {
    return getCustomApplicationDescription();
  }

  return application?.description ?? '';
};
