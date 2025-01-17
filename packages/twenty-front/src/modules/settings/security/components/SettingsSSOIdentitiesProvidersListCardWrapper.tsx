/* @license Enterprise */

import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsSSOIdentityProviderRowRightContainer } from '@/settings/security/components/SettingsSSOIdentityProviderRowRightContainer';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { guessSSOIdentityProviderIconByUrl } from '@/settings/security/utils/guessSSOIdentityProviderIconByUrl';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';

export const SettingsSSOIdentitiesProvidersListCardWrapper = () => {
  const navigate = useNavigate();
  const { t } = useLingui();

  const SSOIdentitiesProviders = useRecoilValue(SSOIdentitiesProvidersState);

  return (
    <SettingsListCard
      items={SSOIdentitiesProviders}
      getItemLabel={(SSOIdentityProvider) =>
        t`${SSOIdentityProvider.name} - ${SSOIdentityProvider.type}`
      }
      RowIconFn={(SSOIdentityProvider) =>
        guessSSOIdentityProviderIconByUrl(SSOIdentityProvider.issuer)
      }
      RowRightComponent={({ item: SSOIdp }) => (
        <SettingsSSOIdentityProviderRowRightContainer SSOIdp={SSOIdp} />
      )}
      hasFooter
      footerButtonLabel={t`Add SSO Identity Provider`}
      onFooterButtonClick={() =>
        navigate(getSettingsPagePath(SettingsPath.NewSSOIdentityProvider))
      }
    />
  );
};
