import { type ApplicationRegistration } from '~/generated-metadata/graphql';

import { useLingui } from '@lingui/react/macro';
import { Link, useLocation } from 'react-router-dom';
import { InlineBanner } from 'twenty-ui/components/feedback';
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
  const { t } = useLingui();
  const location = useLocation();

  return (
    <>
      {!registration.isConfigured && fromAdmin && (
        <InlineBanner
          status="error"
          action={
            <InlineBanner.Action
              href={`${location.pathname}${location.search}#config`}
              render={
                <Link
                  to={{ search: location.search, hash: '#config' }}
                  state={location.state}
                />
              }
            >{t`Configure`}</InlineBanner.Action>
          }
        >{t`This app is not fully configured. Users won't be able to install it until all required server variables are set, and — for apps exposing a server route — until the app is claimed and installed on its owner workspace.`}</InlineBanner>
      )}
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
