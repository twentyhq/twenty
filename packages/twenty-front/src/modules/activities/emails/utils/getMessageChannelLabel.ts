import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { BUILT_IN_ACCOUNT_APPS } from '@/settings/app-preferences/constants/BuiltInAccountApps';
import { getInstalledApplicationDisplayName } from '@/settings/app-preferences/utils/getInstalledApplicationDisplayName';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { type TimelineThreadChannel } from '~/generated/graphql';

export const getMessageChannelLabel = ({
  channel,
  currentWorkspace,
}: {
  channel:
    | Pick<TimelineThreadChannel, 'provider' | 'applicationId'>
    | null
    | undefined;
  currentWorkspace:
    | Pick<
        CurrentWorkspace,
        'installedApplications' | 'workspaceCustomApplication'
      >
    | null
    | undefined;
}): string => {
  const applicationId = channel?.applicationId;

  if (isDefined(applicationId)) {
    return getInstalledApplicationDisplayName({
      applicationId,
      currentWorkspace,
    });
  }

  const builtInAccountApp = BUILT_IN_ACCOUNT_APPS.find(
    ({ provider }) => provider === channel?.provider,
  );

  return isDefined(builtInAccountApp) ? t(builtInAccountApp.name) : t`Email`;
};
