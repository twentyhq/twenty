import { type ApplicationRegistration } from '~/generated-metadata/graphql';
import { SettingsApplicationRegistrationInstalledWorkspaces } from '~/pages/settings/applications/components/SettingsApplicationRegistrationInstalledWorkspaces';
import { SettingsApplicationRegistrationInstallStats } from '~/pages/settings/applications/components/SettingsApplicationRegistrationInstallStats';

export const SettingsApplicationRegistrationGeneralStats = ({
  registration,
  fromAdmin,
}: {
  registration: ApplicationRegistration;
  fromAdmin?: boolean;
}) => {
  return (
    <>
      <SettingsApplicationRegistrationInstallStats
        registration={registration}
        fromAdmin={fromAdmin}
      />
      <SettingsApplicationRegistrationInstalledWorkspaces
        registration={registration}
        fromAdmin={fromAdmin}
      />
    </>
  );
};
