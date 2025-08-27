/* @license Enterprise */

import { SettingsSecuritySSORowDropdownMenu } from '@/settings/security/components/SSO/SettingsSecuritySSORowDropdownMenu';
import { type SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { getColorBySSOIdentityProviderStatus } from '@/settings/security/utils/getColorBySSOIdentityProviderStatus';
import styled from '@emotion/styled';
import { type UnwrapRecoilValue } from 'recoil';
import { Status } from 'twenty-ui/display';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsSSOIdentityProviderRowRightContainer = ({
  SSOIdp,
}: {
  SSOIdp: UnwrapRecoilValue<typeof SSOIdentitiesProvidersState>[0];
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
