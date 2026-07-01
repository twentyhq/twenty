import { SignInUpWorkspaceActivation } from '@/auth/sign-in-up/components/SignInUpWorkspaceActivation';
import { SignInUpWorkspaceActivationEffect } from '@/auth/sign-in-up/components/internal/SignInUpWorkspaceActivationEffect';
import { styled } from '@linaria/react';
import { useState } from 'react';

const StyledContainer = styled.div`
  align-items: center;
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
      <SignInUpWorkspaceActivationEffect
        messageIndex={messageIndex}
        setMessageIndex={setMessageIndex}
      />
      <SignInUpWorkspaceActivation messageIndex={messageIndex} />
    </StyledContainer>
  );
};
