import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledDashContainer = styled.div`
  display: flex;
  width: ${themeCssVariables.spacing[2]};
  justify-content: center;
  align-items: center;
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
