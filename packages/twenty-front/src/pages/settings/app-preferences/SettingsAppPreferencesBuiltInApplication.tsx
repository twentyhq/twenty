import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { SettingsAppPreferencesBuiltInAccountsTable } from '@/settings/app-preferences/components/SettingsAppPreferencesBuiltInAccountsTable';
import { useBuiltInApps } from '@/settings/app-preferences/hooks/useBuiltInApps';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useLingui } from '@lingui/react/macro';
import { Navigate, useParams } from 'react-router-dom';
import { ConnectedAccountProvider, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconSettings } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsAppPreferencesBuiltInApplication = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { builtInAppId } = useParams<{ builtInAppId: string }>();
  const { builtInApps } = useBuiltInApps();
  const { accounts, loading } = useMyConnectedAccounts();
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const navigateSettings = useNavigateSettings();
  const builtInApp = builtInApps.find(
    (application) => application.id === builtInAppId,
  );

  if (!isDefined(builtInApp)) {
    return (
      <Navigate to={getSettingsPath(SettingsPath.AppPreferences)} replace />
    );
  }

  const appAccounts = accounts.filter(
    (account) => account.provider === builtInApp.provider,
  );
  const handleAddAccount = () => {
    if (builtInApp.provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV) {
      navigateSettings(SettingsPath.NewImapSmtpCaldavConnection);
      return;
    }

    triggerApisOAuth(builtInApp.provider, {
      redirectLocation: getSettingsPath(
        SettingsPath.AppPreferencesBuiltInApplication,
        { builtInAppId: builtInApp.id },
      ),
    });
  };

  return (
    <SettingsPageLayout
      title={builtInApp.name}
      icon={<builtInApp.Icon size={theme.icon.size.md} />}
      links={[
        {
          children: t`Apps`,
          href: getSettingsPath(SettingsPath.AppPreferences),
        },
        { children: builtInApp.name },
      ]}
      secondaryBar={
        <SettingsTabBar
          aria-label={t`App preferences tabs`}
          componentInstanceId={`app-preferences-${builtInApp.id}`}
          tabs={[{ id: 'general', title: t`General`, Icon: IconSettings }]}
        />
      }
    >
      <SettingsPageContainer>
        <Section.Root>
          <Section.Header
            title={t`Accounts`}
            description={t`Shared accounts between apps`}
          />
          {loading ? (
            <SettingsSectionSkeletonLoader />
          ) : (
            <SettingsAppPreferencesBuiltInAccountsTable
              accounts={appAccounts}
              onAddAccount={handleAddAccount}
            />
          )}
        </Section.Root>
        <SettingsAccountsBlocklistSection />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
