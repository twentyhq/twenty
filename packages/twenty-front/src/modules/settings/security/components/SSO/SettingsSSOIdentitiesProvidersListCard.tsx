/* @license Enterprise */

import { Link } from 'react-router-dom';

import { SettingsPath } from 'twenty-shared/types';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsSSOIdentitiesProvidersListCardWrapper } from '@/settings/security/components/SSO/SettingsSSOIdentitiesProvidersListCardWrapper';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { type ApolloError } from '@apollo/client';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconKey } from 'twenty-ui/display';
import { useGetSsoIdentityProvidersQuery } from '~/generated-metadata/graphql';

const StyledLinkContainer = styled.div<{ isDisabled: boolean }>`
  pointer-events: ${({ isDisabled }) => (isDisabled ? 'none' : 'auto')};

  > a {
    text-decoration: none;
  }
`;

export const SettingsSSOIdentitiesProvidersListCard = () => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { t } = useLingui();

  const [SSOIdentitiesProviders, setSSOIdentitiesProviders] = useAtomState(
    SSOIdentitiesProvidersState,
  );

  const { loading } = useGetSsoIdentityProvidersQuery({
    fetchPolicy: 'network-only',
    skip: currentWorkspace?.hasValidEnterpriseKey === false,
    onCompleted: (data) => {
      setSSOIdentitiesProviders(data?.getSSOIdentityProviders ?? []);
    },
    onError: (error: ApolloError) => {
      enqueueErrorSnackBar({
        apolloError: error,
      });
    },
  });

  return loading || !SSOIdentitiesProviders.length ? (
    <StyledLinkContainer
      isDisabled={currentWorkspace?.hasValidEnterpriseKey !== true}
    >
      <Link to={getSettingsPath(SettingsPath.NewSSOIdentityProvider)}>
        <SettingsCard
          title={t`Add SSO Identity Provider`}
          disabled={currentWorkspace?.hasValidEnterpriseKey !== true}
          Icon={<IconKey />}
        />
      </Link>
    </StyledLinkContainer>
  ) : (
    <SettingsSSOIdentitiesProvidersListCardWrapper />
  );
};
