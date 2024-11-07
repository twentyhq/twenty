/* @license Enterprise */

import { Link } from 'react-router-dom';

import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsSSOIdentitiesProvidersListCardWrapper } from '@/settings/security/components/SettingsSSOIdentitiesProvidersListCardWrapper';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProviders.state';
import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { IconKey } from 'twenty-ui';

const StyledLink = styled(Link, {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== 'isDisabled',
})<{ isDisabled: boolean }>`
  pointer-events: ${({ isDisabled }) => (isDisabled ? 'none' : 'auto')};
  text-decoration: none;
`;

export const SettingsSSOIdentitiesProvidersListCard = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const SSOIdentitiesProviders = useRecoilValue(SSOIdentitiesProvidersState);

  return !SSOIdentitiesProviders.length ? (
    <StyledLink
      to={getSettingsPagePath(SettingsPath.NewSSOIdentityProvider)}
      isDisabled={currentWorkspace?.hasValidEntrepriseKey !== true}
    >
      <SettingsCard
        title="Add SSO Identity Provider"
        disabled={currentWorkspace?.hasValidEntrepriseKey !== true}
        Icon={<IconKey />}
      />
    </StyledLink>
  ) : (
    <SettingsSSOIdentitiesProvidersListCardWrapper />
  );
};
