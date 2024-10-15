import { Status } from '@/ui/display/status/components/Status';
import styled from '@emotion/styled';
import { UnwrapRecoilValue } from 'recoil';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProviders.state';
import { SettingsSecuritySSORowDropdownMenu } from '@/settings/security/components/SettingsSecuritySSORowDropdownMenu';
import { getColorBySSOIdentityProviderStatus } from '@/settings/security/utils/getColorBySSOIdentityProviderStatus';

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
