import { SettingsAppPreferencesConnectionsTab } from '@/settings/app-preferences/components/SettingsAppPreferencesConnectionsTab';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { SettingsApplicationOverviewCard } from '@/settings/applications/components/SettingsApplicationOverviewCard';
import { useApplicationOverview } from '@/settings/applications/hooks/useApplicationOverview';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { type ReactNode } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconSettings } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type SettingsAppPreferencesGeneralTabProps = {
  application: ApplicationWithPreferences['application'];
  displayName: string;
  connectionProviders: ApplicationWithPreferences['connectionProviders'];
  settingsMenuItems: ApplicationWithPreferences['settingsMenuItems'];
  healthCheckBanner?: ReactNode;
};

export const SettingsAppPreferencesGeneralTab = ({
  application,
  displayName,
  connectionProviders,
  settingsMenuItems,
  healthCheckBanner,
}: SettingsAppPreferencesGeneralTabProps) => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();

  const canManageApplications = useHasPermissionFlag(
    PermissionFlagType.APPLICATIONS,
  );

  const { description, coverImageUrl } = useApplicationOverview({
    application,
  });

  return (
    <>
      <Section.Root>
        <SettingsApplicationOverviewCard
          applicationId={application.id}
          displayName={displayName}
          description={description}
          coverImageUrl={coverImageUrl}
          actions={
            canManageApplications
              ? [
                  <Button
                    key="workspace-settings"
                    startIcon={<IconSettings />}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigateSettings(SettingsPath.ApplicationDetail, {
                        applicationId: application.id,
                      })
                    }
                  >
                    {t`Open workspace settings`}
                  </Button>,
                ]
              : undefined
          }
        />
      </Section.Root>
      {healthCheckBanner}
      {isNonEmptyArray(connectionProviders) && (
        <SettingsAppPreferencesConnectionsTab
          applicationId={application.id}
          connectionProviders={connectionProviders}
          settingsMenuItems={settingsMenuItems}
        />
      )}
    </>
  );
};
