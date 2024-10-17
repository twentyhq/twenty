/* @license Enterprise */

import { useNavigate } from 'react-router-dom';

import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';

import { SettingsSSOIdentitiesProvidersListEmptyStateCard } from '@/settings/security/components/SettingsSSOIdentitiesProvidersListEmptyStateCard';
import { SettingsSSOIdentityProviderRowRightContainer } from '@/settings/security/components/SettingsSSOIdentityProviderRowRightContainer';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProviders.state';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilState } from 'recoil';
import { useListSsoIdentityProvidersByWorkspaceIdQuery } from '~/generated/graphql';
import { SettingsListCard } from '../../components/SettingsListCard';
import { guessSSOIdentityProviderIconByUrl } from '../utils/guessSSOIdentityProviderIconByUrl';

export const SettingsSSOIdentitiesProvidersListCard = () => {
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();

  const [SSOIdentitiesProviders, setSSOIdentitiesProviders] = useRecoilState(
    SSOIdentitiesProvidersState,
  );

  const { loading } = useListSsoIdentityProvidersByWorkspaceIdQuery({
    onCompleted: (data) => {
      setSSOIdentitiesProviders(
        data?.listSSOIdentityProvidersByWorkspaceId ?? [],
      );
    },
    onError: (error: Error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  return !SSOIdentitiesProviders.length && !loading ? (
    <SettingsSSOIdentitiesProvidersListEmptyStateCard />
  ) : (
    <SettingsListCard
      items={SSOIdentitiesProviders}
      getItemLabel={(SSOIdentityProvider) =>
        `${SSOIdentityProvider.name} - ${SSOIdentityProvider.type}`
      }
      isLoading={loading}
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
