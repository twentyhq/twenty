/* @license Enterprise */

import { Link } from 'react-router-dom';

import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';

import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProviders.state';
import { useRecoilValue } from 'recoil';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { IconKey } from 'twenty-ui';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import styled from '@emotion/styled';
import { SettingsSSOIdentitiesProvidersListCardWrapper } from '@/settings/security/components/SettingsSSOIdentitiesProvidersListCardWrapper';

const StyledLink = styled(Link)<{ isDisabled: boolean }>`
  pointer-events: ${({ isDisabled }) => (isDisabled ? 'none' : 'auto')};
  text-decoration: none;
`;

export const SettingsSSOIdentitiesProvidersListCard = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const SSOIdentitiesProviders = useRecoilValue(SSOIdentitiesProvidersState);

  return !SSOIdentitiesProviders.length ? (
    <StyledLink
      to={getSettingsPagePath(SettingsPath.NewSSOIdentityProvider)}
      isDisabled={currentWorkspace?.hasEnterpriseFeaturesAccess !== true}
    >
      <SettingsCard
        title="Add SSO Identity Provider"
        disabled={currentWorkspace?.hasEnterpriseFeaturesAccess !== true}
        Icon={<IconKey />}
      />
    </StyledLink>
  ) : (
    <SettingsSSOIdentitiesProvidersListCardWrapper />
  );
};
