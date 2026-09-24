/* @license Enterprise */

import { t } from '@lingui/core/macro';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsSsoIdentityProviderRowRightContainer } from '@/settings/security/components/sso/SettingsSsoIdentityProviderRowRightContainer';
import { ssoIdentitiesProvidersState } from '@/settings/security/states/ssoIdentitiesProvidersState';
import { guessSsoIdentityProviderIconByUrl } from '@/settings/security/utils/guessSsoIdentityProviderIconByUrl';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsSsoIdentitiesProvidersListCardWrapper = () => {
  const navigate = useNavigateSettings();

  const ssoIdentitiesProviders = useAtomStateValue(ssoIdentitiesProvidersState);

  return (
    <SettingsListCard
      items={ssoIdentitiesProviders}
      getItemLabel={(ssoIdentityProvider) =>
        `${ssoIdentityProvider.name} - ${ssoIdentityProvider.type}`
      }
      RowIconFn={(ssoIdentityProvider) =>
        guessSsoIdentityProviderIconByUrl(ssoIdentityProvider.issuer)
      }
      RowRightComponent={({ item: ssoIdp }) => (
        <SettingsSsoIdentityProviderRowRightContainer ssoIdp={ssoIdp} />
      )}
      hasFooter
      footerButtonLabel={t`Add SSO Identity Provider`}
      onFooterButtonClick={() => navigate(SettingsPath.NewSsoIdentityProvider)}
    />
  );
};
