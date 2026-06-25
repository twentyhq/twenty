import { SignInUpWorkspaceActivationV2 } from '@/auth/sign-in-up/components/SignInUpWorkspaceActivationV2';
import { SignInUpWorkspaceActivationV2Effect } from '@/auth/sign-in-up/components/internal/SignInUpWorkspaceActivationV2Effect';
import { styled } from '@linaria/react';
import { useState } from 'react';
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

export const SignInUpWorkspaceCreationLoader = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  return (
    <StyledContainer>
      <SignInUpWorkspaceActivationV2Effect
        messageIndex={messageIndex}
        setMessageIndex={setMessageIndex}
      />
      <SignInUpWorkspaceActivationV2 messageIndex={messageIndex} />
    </StyledContainer>
  );
};
