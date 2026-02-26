/* @license Enterprise */

import { SettingsSecuritySSORowDropdownMenu } from '@/settings/security/components/SSO/SettingsSecuritySSORowDropdownMenu';
import { type SSOIdentityProvider } from '@/settings/security/types/SSOIdentityProvider';
import { getColorBySSOIdentityProviderStatus } from '@/settings/security/utils/getColorBySSOIdentityProviderStatus';
import styled from '@emotion/styled';
import { Status } from 'twenty-ui/display';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsSSOIdentityProviderRowRightContainer = ({
  SSOIdp,
}: {
  SSOIdp: Omit<SSOIdentityProvider, '__typename'>;
}) => {
  return (
    <StyledRowRightContainer>
      <Status
        color={getColorBySSOIdentityProviderStatus[SSOIdp.status]}
        text={SSOIdp.status}
        weight="medium"
      />
      <SettingsSecuritySSORowDropdownMenu SSOIdp={SSOIdp} />
    </StyledRowRightContainer>
  );
};
