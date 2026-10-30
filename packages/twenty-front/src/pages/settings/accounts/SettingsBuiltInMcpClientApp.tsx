import { AppChip } from '@/applications/components/AppChip';
import { BUILT_IN_MCP_CLIENT_APPS } from '@/settings/app-preferences/constants/BuiltInMcpClientApps';
import { getBuiltInAppLogoUrl } from '@/settings/app-preferences/utils/getBuiltInAppLogoUrl';
import { SettingsApplicationOverviewCard } from '@/settings/applications/components/SettingsApplicationOverviewCard';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { getBuiltInMcpClientAppConnectLink } from '@/settings/mcp/utils/getBuiltInMcpClientAppConnectLink';
import { buildMcpServerUrl } from '@/settings/mcp/utils/mcpSetup';
import { useLingui } from '@lingui/react/macro';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const SettingsBuiltInMcpClientApp = () => {
  const { t } = useLingui();
  const { applicationId } = useParams<{ applicationId: string }>();
  const app = BUILT_IN_MCP_CLIENT_APPS.find(
    (builtInMcpClientApp) => builtInMcpClientApp.id === applicationId,
  );

  if (!isDefined(app)) {
    return (
      <Navigate to={getSettingsPath(SettingsPath.AppPreferences)} replace />
    );
  }

  const appName = t(app.name);
  const logoUrl = getBuiltInAppLogoUrl(app);
  const connectLink = getBuiltInMcpClientAppConnectLink({
    builtInMcpClientAppId: app.id,
    mcpServerUrl: buildMcpServerUrl(REACT_APP_SERVER_BASE_URL),
  });

  return (
    <SettingsPageLayout
      title={appName}
      icon={
        <AppChip
          logoUrl={logoUrl}
          fallbackApplicationData={{ name: appName }}
          size="md"
          chipOnly
        />
      }
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: t`Apps preferences`,
          href: getSettingsPath(SettingsPath.AppPreferences),
        },
        { children: appName },
      ]}
    >
      <SettingsPageContainer>
        <Section.Root>
          <SettingsApplicationOverviewCard
            logoUrl={logoUrl}
            displayName={appName}
            description={t(app.description)}
          />
        </Section.Root>
        <Section.Root>
          <Section.Header
            title={t`Connection`}
            description={t`Let ${appName} access your workspace on your behalf.`}
          />
          <SettingsCard
            Icon={<AppChip logoUrl={logoUrl} size="md" chipOnly />}
            title={t`Connect with ${appName}`}
            description={
              isDefined(connectLink)
                ? undefined
                : t`${appName} connections require an HTTPS server URL.`
            }
            href={connectLink}
            disabled={!isDefined(connectLink)}
          />
        </Section.Root>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
