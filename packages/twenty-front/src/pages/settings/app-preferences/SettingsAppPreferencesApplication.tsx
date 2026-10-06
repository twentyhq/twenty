import { AppChip } from '@/applications/components/AppChip';
import { CurrentApplicationContext } from '@/applications/contexts/CurrentApplicationContext';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { SettingsAppPreferencesApplicationAccountsSection } from '@/settings/app-preferences/components/SettingsAppPreferencesApplicationAccountsSection';
import { SettingsAppPreferencesApplicationSettingsSection } from '@/settings/app-preferences/components/SettingsAppPreferencesApplicationSettingsSection';
import { useAppPreferencesApplications } from '@/settings/app-preferences/hooks/useAppPreferencesApplications';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { SettingsMenuItemScope } from '~/generated-metadata/graphql';
import { getSettingsMenuItemsForScope } from '@/settings/applications/utils/getSettingsMenuItemsForScope';

// What a member sets for one installed app: the accounts it uses on their
// behalf and its USER-scoped settings menu items.
export const SettingsAppPreferencesApplication = () => {
  const { t } = useLingui();
  const { applicationId = '' } = useParams<{ applicationId: string }>();

  const { applications, loading: applicationsLoading } =
    useAppPreferencesApplications();
  const { accounts, loading: accountsLoading } = useMyConnectedAccounts({
    includeApplicationAccounts: true,
  });

  const application = applications.find(({ id }) => id === applicationId);

  const applicationAccounts = accounts.filter(
    (account) => account.applicationId === applicationId,
  );

  const userSettingsMenuItems = getSettingsMenuItemsForScope(
    application?.settingsMenuItems ?? [],
    SettingsMenuItemScope.USER,
  );

  const loading = applicationsLoading || accountsLoading;
  const title = application?.name ?? t`App preferences`;

  return (
    <CurrentApplicationContext.Provider value={application?.id ?? null}>
      <SettingsPageLayout
        title={title}
        icon={
          isDefined(application) ? (
            <AppChip
              applicationId={application.id}
              logoUrl={application.logoUrl}
              fallbackApplicationData={{ name: application.name }}
              size="md"
              chipOnly
            />
          ) : undefined
        }
        links={[
          {
            children: t`User`,
            href: getSettingsPath(SettingsPath.ProfilePage),
          },
          {
            children: t`App preferences`,
            href: getSettingsPath(SettingsPath.Accounts),
          },
          { children: title },
        ]}
      >
        <SettingsPageContainer overflow="visible">
          {loading ? (
            <SettingsSectionSkeletonLoader />
          ) : (
            isDefined(application) && (
              <>
                <SettingsAppPreferencesApplicationAccountsSection
                  applicationId={application.id}
                  accounts={applicationAccounts}
                />
                {userSettingsMenuItems.map((settingsMenuItem) => (
                  <SettingsAppPreferencesApplicationSettingsSection
                    key={settingsMenuItem.id}
                    title={settingsMenuItem.title}
                    frontComponentId={settingsMenuItem.frontComponentId}
                  />
                ))}
              </>
            )
          )}
        </SettingsPageContainer>
      </SettingsPageLayout>
    </CurrentApplicationContext.Provider>
  );
};
