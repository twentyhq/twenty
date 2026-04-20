import { type ApplicationRegistration } from '~/generated-metadata/graphql';

import { SettingsApplicationRegistrationGeneralInfo } from '~/pages/settings/applications/components/SettingsApplicationRegistrationGeneralInfo';

import { SettingsAdminApplicationRegistrationDangerZone } from '~/pages/settings/admin-panel/SettingsAdminApplicationRegistrationDangerZone';
import { SettingsApplicationRegistrationGeneralStats } from '~/pages/settings/applications/components/SettingsApplicationRegistrationGeneralStats';
import { SettingsAdminApplicationRegistrationGeneralToggles } from '~/pages/settings/admin-panel/SettingsAdminApplicationRegistrationGeneralToggles';

export const SettingsApplicationRegistrationGeneralTab = ({
  registration,
  fromAdmin,
}: {
  registration: ApplicationRegistration;
  fromAdmin?: boolean;
}) => {
  return (
    <>
      <SettingsApplicationRegistrationGeneralInfo registration={registration} />
      {fromAdmin && (
        <SettingsAdminApplicationRegistrationGeneralToggles
          registration={registration}
        />
      )}
      <SettingsApplicationRegistrationGeneralStats
        registration={registration}
      />
      <SettingsAdminApplicationRegistrationDangerZone
        registration={registration}
        fromAdmin={fromAdmin}
      />
    </>
  );
};
