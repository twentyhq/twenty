/* @license Enterprise */

import { Link } from 'react-router-dom';

import { SettingsPath } from 'twenty-shared/types';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsSsoIdentitiesProvidersListCardWrapper } from '@/settings/security/components/Sso/SettingsSsoIdentitiesProvidersListCardWrapper';
import { SsoIdentitiesProvidersState } from '@/settings/security/states/SsoIdentitiesProvidersState';
import { useSnackBarOnQueryError } from '@/apollo/hooks/useSnackBarOnQueryError';
import { styled } from '@linaria/react';
import { useEffect } from 'react';
import { useLingui } from '@lingui/react/macro';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconKey } from 'twenty-ui/display';
import { useQuery } from '@apollo/client/react';
import { GetSsoIdentityProvidersDocument } from '~/generated-metadata/graphql';

const StyledLinkContainer = styled.div<{ isDisabled: boolean }>`
  pointer-events: ${({ isDisabled }) => (isDisabled ? 'none' : 'auto')};

  > a {
    text-decoration: none;
  }
`;

export const SettingsSsoIdentitiesProvidersListCard = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { t } = useLingui();

  const [SsoIdentitiesProviders, setSsoIdentitiesProviders] = useAtomState(
    SsoIdentitiesProvidersState,
  );

  const {
    loading,
    data: SsoData,
    error: SsoError,
  } = useQuery(GetSsoIdentityProvidersDocument, {
    fetchPolicy: 'network-only',
    skip: currentWorkspace?.hasValidEnterpriseKey === false,
  });

  useEffect(() => {
    if (SsoData) {
      setSsoIdentitiesProviders(SsoData?.getSsoIdentityProviders ?? []);
    }
  }, [SsoData, setSsoIdentitiesProviders]);

  useSnackBarOnQueryError(SsoError);

  return loading || !SsoIdentitiesProviders.length ? (
    <StyledLinkContainer
      isDisabled={currentWorkspace?.hasValidEnterpriseKey !== true}
    >
      <Link to={getSettingsPath(SettingsPath.NewSsoIdentityProvider)}>
        <SettingsCard
          title={t`Add Sso Identity Provider`}
          disabled={currentWorkspace?.hasValidEnterpriseKey !== true}
          Icon={<IconKey />}
        />
      </Link>
    </StyledLinkContainer>
  ) : (
    <SettingsSsoIdentitiesProvidersListCardWrapper />
  );
};
