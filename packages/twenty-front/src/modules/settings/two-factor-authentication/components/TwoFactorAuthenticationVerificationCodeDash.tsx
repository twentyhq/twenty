import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledDashContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  width: ${themeCssVariables.spacing[2]};
`;

const StyledDash = styled.div`
  background-color: ${themeCssVariables.font.color.light};
  height: 1.6px;
  width: ${themeCssVariables.spacing['1.5']};
`;

export const TwoFactorAuthenticationVerificationCodeDash = () => {
  return (
    <StyledDashContainer>
      <StyledDash />
    </StyledDashContainer>
  );
};
