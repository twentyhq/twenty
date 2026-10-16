import { type ApplicationRegistration } from '~/generated-metadata/graphql';

import { SettingsApplicationRegistrationGeneralInfo } from '~/pages/settings/applications/components/SettingsApplicationRegistrationGeneralInfo';

import { SettingsAdminApplicationRegistrationClaims } from '~/pages/settings/admin-panel/SettingsAdminApplicationRegistrationClaims';
import { SettingsAdminApplicationRegistrationDangerZone } from '~/pages/settings/admin-panel/SettingsAdminApplicationRegistrationDangerZone';
import { SettingsAdminApplicationRegistrationGeneralSwitches } from '~/pages/settings/admin-panel/SettingsAdminApplicationRegistrationGeneralSwitches';
import { SettingsApplicationRegistrationGeneralStats } from '~/pages/settings/applications/components/SettingsApplicationRegistrationGeneralStats';

export const SettingsApplicationRegistrationGeneralTab = ({
  registration,
  isAdminView,
}: {
  registration: ApplicationRegistration;
  isAdminView?: boolean;
}) => {
  return (
    <>
      <SettingsApplicationRegistrationGeneralInfo
        registration={registration}
        isAdminView={isAdminView}
      />
      {isAdminView && (
        <SettingsAdminApplicationRegistrationGeneralSwitches
          registration={registration}
        />
      )}
      {isAdminView && (
        <SettingsAdminApplicationRegistrationClaims
          applicationRegistrationId={registration.id}
        />
      )}
      <SettingsApplicationRegistrationGeneralStats
        registration={registration}
        isAdminView={isAdminView}
      />
      <SettingsAdminApplicationRegistrationDangerZone
        registration={registration}
        isAdminView={isAdminView}
      />
    </>
  );
};
