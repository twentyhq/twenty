import { type ApplicationRegistration } from '~/generated-metadata/graphql';

import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { InlineBanner } from 'twenty-ui/feedback';
import { SettingsApplicationRegistrationGeneralInfo } from '~/pages/settings/applications/components/SettingsApplicationRegistrationGeneralInfo';

import { SettingsAdminApplicationRegistrationClaims } from '~/pages/settings/admin-panel/SettingsAdminApplicationRegistrationClaims';
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
          message={t`This app is not fully configured. Users won't be able to install it until all required server variables are set, and — for apps exposing a server route — until the app is claimed and installed on its owner workspace.`}
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
