import { BUILT_IN_MCP_CLIENT_APPS } from '@/settings/app-preferences/constants/BuiltInMcpClientApps';
import { useBuiltInMcpClientAppStatusesById } from '@/settings/app-preferences/hooks/useBuiltInMcpClientAppStatusesById';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsApplicationsTable } from '@/settings/applications/components/SettingsApplicationsTable';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledToolbar = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

export const SettingsBuiltInMcpClientAppsSection = () => {
  const { t } = useLingui();
  const { statusesById, isLoading, hasLoadError, refetch } =
    useBuiltInMcpClientAppStatusesById();

  return (
    <SettingsApplicationsTable
      title={t`Apps`}
      description={t`Choose your preferences for the apps installed on your workspace by the admin`}
      toolbar={
        hasLoadError ? (
          <StyledToolbar>
            <SettingsApplicationLoadErrorBanner
              message={t`Your connections could not be loaded. Check your connection and try again.`}
              onRetry={() => refetch().catch(() => undefined)}
            />
          </StyledToolbar>
        ) : undefined
      }
      applications={[]}
      builtInApps={BUILT_IN_MCP_CLIENT_APPS}
      linkTarget="applicationPreferences"
      middleColumn="status"
      statusesById={statusesById}
      isLoadingStatuses={isLoading}
    />
  );
};
