import { useNavigate } from 'react-router-dom';

import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';

import { SettingsListCard } from '../../components/SettingsListCard';
import { SettingsSSOIdentityProviderRowRightContainer } from '@/settings/security/components/SettingsSSOIdentityProviderRowRightContainer';
import { useRecoilState } from 'recoil';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProviders.state';
import { SettingsSSOIdentitiesProvidersListEmptyStateCard } from '@/settings/security/components/SettingsSSOIdentitiesProvidersListEmptyStateCard';
import { gessIconByUrl } from '../utils/gessIconByUrl';
import { useListSsoIdentityProvidersByWorkspaceIdQuery } from '~/generated/graphql';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

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

  if (!SSOIdentitiesProviders.length && !loading) {
    return <SettingsSSOIdentitiesProvidersListEmptyStateCard />;
  }

  return (
    <SettingsListCard
      items={SSOIdentitiesProviders}
      getItemLabel={(SSOIdentityProvider) =>
        `${SSOIdentityProvider.name} - ${SSOIdentityProvider.type}`
      }
      isLoading={loading}
      RowIconFn={(SSOIdentityProvider) =>
        gessIconByUrl(SSOIdentityProvider.issuer)
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
