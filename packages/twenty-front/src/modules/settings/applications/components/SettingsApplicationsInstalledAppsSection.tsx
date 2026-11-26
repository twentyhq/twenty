import { useInstalledApplications } from '@/applications/hooks/useInstalledApplications';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsApplicationsTable } from '@/settings/applications/components/SettingsApplicationsTable';
import { useEnabledBuiltInAccountApps } from '@/settings/app-preferences/hooks/useEnabledBuiltInAccountApps';
import { useWorkspaceApplicationStatusesById } from '@/settings/applications/hooks/useWorkspaceApplicationStatusesById';
import { isOAuthOnlyApplication } from '@/settings/applications/utils/isOAuthOnlyApplication';
import { getApplicationsWithConnectedMembersDescription } from '@/settings/applications/utils/getApplicationsWithConnectedMembersDescription';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { WorkspaceApplicationConnectedMemberCountsDocument } from '~/generated-metadata/graphql';

const StyledToolbar = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

export const SettingsApplicationsInstalledAppsSection = () => {
  const { t } = useLingui();
  const installedApplications = useInstalledApplications();
  const { enabledBuiltInAccountApps } = useEnabledBuiltInAccountApps();
  const { data: connectedMemberCountsData } = useQuery(
    WorkspaceApplicationConnectedMemberCountsDocument,
    {
      fetchPolicy: 'cache-and-network',
      skip: !installedApplications.some(isOAuthOnlyApplication),
    },
  );
  const {
    statusesById,
    isLoading: isLoadingStatuses,
    error: statusError,
    refetch: refetchStatuses,
  } = useWorkspaceApplicationStatusesById({
    applications: installedApplications,
  });

  if (installedApplications.length === 0) {
    return null;
  }

  return (
    <SettingsApplicationsTable
      title={t`Installed apps`}
      description={t`All the applications currently installed on this workspace`}
      toolbar={
        isDefined(statusError) ? (
          <StyledToolbar>
            <SettingsApplicationLoadErrorBanner
              message={t`App configuration could not be loaded. Check your connection and try again.`}
              // A failed retry sets the query error again, so the banner stays
              onRetry={() => refetchStatuses().catch(() => undefined)}
            />
          </StyledToolbar>
        ) : undefined
      }
      applications={
        isDefined(connectedMemberCountsData)
          ? getApplicationsWithConnectedMembersDescription({
              applications: installedApplications,
              connectedMemberCounts:
                connectedMemberCountsData.workspaceApplicationConnectedMemberCounts,
            })
          : installedApplications
      }
      builtInAccountApps={enabledBuiltInAccountApps}
      linkTarget="applicationDetail"
      middleColumn="typeOrStatus"
      statusesById={statusesById}
      isLoadingStatuses={isLoadingStatuses}
    />
  );
};
