/* @license Enterprise */

import { t } from '@lingui/core/macro';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsSsoIdentityProviderRowRightContainer } from '@/settings/security/components/Sso/SettingsSsoIdentityProviderRowRightContainer';
import { SsoIdentitiesProvidersState } from '@/settings/security/states/SsoIdentitiesProvidersState';
import { guessSsoIdentityProviderIconByUrl } from '@/settings/security/utils/guessSsoIdentityProviderIconByUrl';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsSsoIdentitiesProvidersListCardWrapper = () => {
  const navigate = useNavigateSettings();

  const SsoIdentitiesProviders = useAtomStateValue(SsoIdentitiesProvidersState);

  return (
    <SettingsListCard
      items={SsoIdentitiesProviders}
      getItemLabel={(SsoIdentityProvider) =>
        `${SsoIdentityProvider.name} - ${SsoIdentityProvider.type}`
      }
      RowIconFn={(SsoIdentityProvider) =>
        guessSsoIdentityProviderIconByUrl(SsoIdentityProvider.issuer)
      }
      RowRightComponent={({ item: SsoIdp }) => (
        <SettingsSsoIdentityProviderRowRightContainer SsoIdp={SsoIdp} />
      )}
      hasFooter
      footerButtonLabel={t`Add Sso Identity Provider`}
      onFooterButtonClick={() => navigate(SettingsPath.NewSsoIdentityProvider)}
    />
  );
};
