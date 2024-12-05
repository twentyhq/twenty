/* @license Enterprise */

import { guessSSOIdentityProviderIconByUrl } from '@/settings/security/utils/guessSSOIdentityProviderIconByUrl';
import { SettingsSSOIdentityProviderRowRightContainer } from '@/settings/security/components/SettingsSSOIdentityProviderRowRightContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { useNavigate } from 'react-router-dom';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { useRecoilValue } from 'recoil';

export const SettingsSSOIdentitiesProvidersListCardWrapper = () => {
  const navigate = useNavigate();

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
      onFooterButtonClick={() =>
        navigate(getSettingsPagePath(SettingsPath.NewSSOIdentityProvider))
      }
    />
  );
};
