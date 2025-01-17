/* @license Enterprise */

import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { IconKey } from 'twenty-ui';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsSSOIdentitiesProvidersListCardWrapper } from '@/settings/security/components/SettingsSSOIdentitiesProvidersListCardWrapper';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useListSsoIdentityProvidersByWorkspaceIdQuery } from '~/generated/graphql';

const StyledLink = styled(Link, {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== 'isDisabled',
})<{ isDisabled: boolean }>`
  pointer-events: ${({ isDisabled }) => (isDisabled ? 'none' : 'auto')};
  text-decoration: none;
`;

export const SettingsSSOIdentitiesProvidersListCard = () => {
  const { enqueueSnackBar } = useSnackBar();
  const { t } = useLingui();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const [SSOIdentitiesProviders, setSSOIdentitiesProviders] = useRecoilState(
    SSOIdentitiesProvidersState,
  );

  const { loading } = useListSsoIdentityProvidersByWorkspaceIdQuery({
    skip: currentWorkspace?.hasValidEntrepriseKey === false,
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
    <StyledLink
      to={getSettingsPagePath(SettingsPath.NewSSOIdentityProvider)}
      isDisabled={currentWorkspace?.hasValidEntrepriseKey !== true}
    >
      <SettingsCard
        title={t`Add SSO Identity Provider`}
        disabled={currentWorkspace?.hasValidEntrepriseKey !== true}
        Icon={<IconKey />}
      />
    </StyledLink>
  ) : (
    <SettingsSSOIdentitiesProvidersListCardWrapper />
  );
};
