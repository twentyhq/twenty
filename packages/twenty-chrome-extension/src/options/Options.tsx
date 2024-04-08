import { Loader } from '@/ui/display/loader/components/Loader';
import { MainButton } from '@/ui/input/button/MainButton';
import styled from '@emotion/styled';
import { useState } from 'react';

const StyledContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.noisy};
  display: flex;
  flex-direction: column;
  height: 100vh;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;
`;

const Options = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const authenticate = () => {
    setIsAuthenticating(true);
    chrome.runtime.sendMessage({ action: "CONNECT" });
  }
  return (
    <StyledContainer>
      <img src="/logo/32-32.svg" alt="twenty-logo" height={64} width={64} />
      {isAuthenticating ? <Loader /> : <StyledButtonContainer>
        <MainButton
          title="Connect your account"
          onClick={() => authenticate()}
          fullWidth
        />
        <MainButton title="Sign up" variant="secondary" onClick={() => window.open(`${import.meta.env.VITE_FRONT_BASE_URL}`,'_blank')} fullWidth />
      </StyledButtonContainer>}
      
     </StyledContainer>
  );
};

export default Options;
