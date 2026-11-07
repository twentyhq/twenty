import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const getInstalledApplicationDisplayName = ({
  applicationId,
  currentWorkspace,
}: {
  applicationId: string | null | undefined;
  currentWorkspace:
    | Pick<
        CurrentWorkspace,
        'installedApplications' | 'workspaceCustomApplication'
      >
    | null
    | undefined;
}): string => {
  const application = currentWorkspace?.installedApplications.find(
    (installedApplication) => installedApplication.id === applicationId,
  );

  return isDefined(application)
    ? getApplicationDisplayName({ application, currentWorkspace })
    : t`Application`;
};
