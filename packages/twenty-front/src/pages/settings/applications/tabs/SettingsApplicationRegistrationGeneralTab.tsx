import { type ApplicationRegistration } from '~/generated-metadata/graphql';

import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { InlineBanner } from 'twenty-ui/display';
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
  const { t } = useLingui();
  const navigate = useNavigate();

  return (
    <>
      {!registration.isConfigured && fromAdmin && (
        <InlineBanner
          color="danger"
          message={t`This app has required server variables that are not configured. Users won't be able to install it until all required variables are set.`}
          button={{
            title: t`Configure`,
            onClick: () => navigate('#config'),
          }}
        />
      )}
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
