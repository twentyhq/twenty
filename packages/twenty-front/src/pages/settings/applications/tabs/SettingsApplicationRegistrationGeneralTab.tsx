import { type ApplicationRegistration } from '~/generated-metadata/graphql';

import { SettingsApplicationRegistrationGeneralInfo } from '~/pages/settings/applications/components/SettingsApplicationRegistrationGeneralInfo';

import { SettingsAdminApplicationRegistrationClaims } from '~/pages/settings/admin-panel/SettingsAdminApplicationRegistrationClaims';
import { SettingsAdminApplicationRegistrationDangerZone } from '~/pages/settings/admin-panel/SettingsAdminApplicationRegistrationDangerZone';
import { SettingsAdminApplicationRegistrationGeneralSwitches } from '~/pages/settings/admin-panel/SettingsAdminApplicationRegistrationGeneralSwitches';
import { SettingsApplicationRegistrationGeneralStats } from '~/pages/settings/applications/components/SettingsApplicationRegistrationGeneralStats';

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
        <SettingsAdminApplicationRegistrationGeneralSwitches
          registration={registration}
        />
      )}
      {fromAdmin && (
        <SettingsAdminApplicationRegistrationClaims
          applicationRegistrationId={registration.id}
        />
      )}
      {fromAdmin && (
        <SettingsApplicationRegistrationGeneralStats
          registration={registration}
        />
      )}
      <SettingsAdminApplicationRegistrationDangerZone
        registration={registration}
        fromAdmin={fromAdmin}
      />
    </>
  );
};
