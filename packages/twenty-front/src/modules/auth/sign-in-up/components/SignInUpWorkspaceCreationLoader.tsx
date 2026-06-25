import { SignInUpWorkspaceActivationV2 } from '@/auth/sign-in-up/components/SignInUpWorkspaceActivationV2';
import { SignInUpWorkspaceActivationV2Effect } from '@/auth/sign-in-up/components/internal/SignInUpWorkspaceActivationV2Effect';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
  width: 100%;
`;

export const SignInUpWorkspaceCreationLoader = () => (
  <StyledContainer>
    <SignInUpWorkspaceActivationV2Effect />
    <SignInUpWorkspaceActivationV2 />
  </StyledContainer>
);
