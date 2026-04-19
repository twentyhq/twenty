/* @license Enterprise */

import { SettingsSecuritySsoRowDropdownMenu } from '@/settings/security/components/Sso/SettingsSecuritySsoRowDropdownMenu';
import { type SsoIdentityProvider } from '@/settings/security/types/SsoIdentityProvider';
import { getColorBySsoIdentityProviderStatus } from '@/settings/security/utils/getColorBySsoIdentityProviderStatus';
import { styled } from '@linaria/react';
import { Status } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const SettingsSsoIdentityProviderRowRightContainer = ({
  SsoIdp,
}: {
  SsoIdp: Omit<SsoIdentityProvider, '__typename'>;
}) => {
  return (
    <StyledRowRightContainer>
      <Status
        color={getColorBySsoIdentityProviderStatus[SsoIdp.status]}
        text={SsoIdp.status}
        weight="medium"
      />
      <SettingsSecuritySsoRowDropdownMenu SsoIdp={SsoIdp} />
    </StyledRowRightContainer>
  );
};
