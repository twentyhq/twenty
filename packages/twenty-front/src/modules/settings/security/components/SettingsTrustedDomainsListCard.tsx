import { Link, useNavigate } from 'react-router-dom';

import { SettingsPath } from '@/types/SettingsPath';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilState, useRecoilValue } from 'recoil';
import { IconMailCog } from 'twenty-ui';
import { useListSsoIdentityProvidersByWorkspaceIdQuery } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { guessSSOIdentityProviderIconByUrl } from '@/settings/security/utils/guessSSOIdentityProviderIconByUrl';
import { SettingsSSOIdentityProviderRowRightContainer } from '@/settings/security/components/SettingsSSOIdentityProviderRowRightContainer';

const StyledLink = styled(Link)`
  text-decoration: none;
`;

export const SettingsTrustedDomainsListCard = () => {
  const { enqueueSnackBar } = useSnackBar();
  const navigate = useNavigate();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { t } = useLingui();

  const [SSOIdentitiesProviders, setSSOIdentitiesProviders] = useRecoilState(
    SSOIdentitiesProvidersState,
  );

  const { loading } = useListSsoIdentityProvidersByWorkspaceIdQuery({
    fetchPolicy: 'network-only',
    skip: currentWorkspace?.hasValidEnterpriseKey === false,
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

  return loading || !SSOIdentitiesProviders.length ? (
    <StyledLink to={getSettingsPath(SettingsPath.NewTrustedDomain)}>
      <SettingsCard
        title={t`Add Trusted Email Domain`}
        Icon={<IconMailCog />}
      />
    </StyledLink>
  ) : (
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
