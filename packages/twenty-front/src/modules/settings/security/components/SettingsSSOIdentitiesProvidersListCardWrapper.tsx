/* @license Enterprise */

import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsSSOIdentityProviderRowRightContainer } from '@/settings/security/components/SettingsSSOIdentityProviderRowRightContainer';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { guessSSOIdentityProviderIconByUrl } from '@/settings/security/utils/guessSSOIdentityProviderIconByUrl';
import { SettingsPath } from '@/types/SettingsPath';
import { useRecoilValue } from 'recoil';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsSSOIdentitiesProvidersListCardWrapper = () => {
  const navigate = useNavigateSettings();

  const SSOIdentitiesProviders = useRecoilValue(SSOIdentitiesProvidersState);

  return (
    <SettingsListCard
      items={SSOIdentitiesProviders}
      getItemLabel={(SSOIdentityProvider) =>
        `${SSOIdentityProvider.name} - ${SSOIdentityProvider.type}`
      }
      RowIconFn={(SSOIdentityProvider) =>
        guessSSOIdentityProviderIconByUrl(SSOIdentityProvider.issuer)
      }
      RowRightComponent={({ item: SSOIdp }) => (
        <SettingsSSOIdentityProviderRowRightContainer SSOIdp={SSOIdp} />
      )}
      hasFooter
      footerButtonLabel="Add SSO Identity Provider"
      onFooterButtonClick={() => navigate(SettingsPath.NewSSOIdentityProvider)}
    />
  );
};
