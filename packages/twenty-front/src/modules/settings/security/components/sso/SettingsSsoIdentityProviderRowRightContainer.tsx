/* @license Enterprise */

import { SettingsSecuritySsoRowDropdownMenu } from '@/settings/security/components/sso/SettingsSecuritySsoRowDropdownMenu';
import { type SsoIdentityProvider } from '@/settings/security/types/SsoIdentityProvider';
import { getColorBySsoIdentityProviderStatus } from '@/settings/security/utils/getColorBySsoIdentityProviderStatus';
import { styled } from '@linaria/react';
import { Status } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const SettingsSsoIdentityProviderRowRightContainer = ({
  ssoIdp,
}: {
  ssoIdp: Omit<SsoIdentityProvider, '__typename'>;
}) => {
  return (
    <StyledRowRightContainer>
      <Status
        color={getColorBySsoIdentityProviderStatus[ssoIdp.status]}
        text={ssoIdp.status}
        weight="medium"
      />
      <SettingsSecuritySsoRowDropdownMenu ssoIdp={ssoIdp} />
    </StyledRowRightContainer>
  );
};
