import styled from '@emotion/styled';

const StyledDashContainer = styled.div`
  display: flex;
  width: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  align-items: center;
`;

const StyledDash = styled.div`
  background-color: ${({ theme }) => theme.font.color.light};
  height: ${({ theme }) => theme.spacing(0.4)};
  width: ${({ theme }) => theme.spacing(1.5)};
`;

export const TwoFactorAuthenticationVerificationCodeDash = () => {
  return (
    <StyledDashContainer>
      <StyledDash />
    </StyledDashContainer>
  );
};
