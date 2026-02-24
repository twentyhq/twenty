/* @license Enterprise */

import { t } from '@lingui/core/macro';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsSSOIdentityProviderRowRightContainer } from '@/settings/security/components/SSO/SettingsSSOIdentityProviderRowRightContainer';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { guessSSOIdentityProviderIconByUrl } from '@/settings/security/utils/guessSSOIdentityProviderIconByUrl';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsSSOIdentitiesProvidersListCardWrapper = () => {
  const navigate = useNavigateSettings();

  const SSOIdentitiesProviders = useAtomValue(SSOIdentitiesProvidersState);

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
      footerButtonLabel={t`Add SSO Identity Provider`}
      onFooterButtonClick={() => navigate(SettingsPath.NewSSOIdentityProvider)}
    />
  );
};
