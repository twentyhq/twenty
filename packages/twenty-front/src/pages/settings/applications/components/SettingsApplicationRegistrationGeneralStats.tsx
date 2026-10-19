import { useLingui } from '@lingui/react/macro';
import { type ApplicationRegistration } from '~/generated-metadata/graphql';
import { SettingsApplicationRegistrationInstalledWorkspaces } from '~/pages/settings/applications/components/SettingsApplicationRegistrationInstalledWorkspaces';
import { SettingsApplicationRegistrationInstallStats } from '~/pages/settings/applications/components/SettingsApplicationRegistrationInstallStats';
import { Section } from 'twenty-ui/components/layout';

export const SettingsApplicationRegistrationGeneralStats = ({
  registration,
  isAdminView = false,
}: {
  registration: ApplicationRegistration;
  isAdminView?: boolean;
}) => {
  const { t } = useLingui();

  return (
    <Section.Root>
      <Section.Header
        title={t`Statistics`}
        description={t`Usage across all non-deleted workspaces on this server`}
      />
      <SettingsApplicationRegistrationInstallStats
        registration={registration}
        isAdminView={isAdminView}
      />
      {isAdminView && (
        <SettingsApplicationRegistrationInstalledWorkspaces
          registration={registration}
        />
      )}
    </Section.Root>
  );
};
