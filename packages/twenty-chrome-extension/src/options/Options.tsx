import { useEffect, useState } from 'react';
import styled from '@emotion/styled';

import { Loader } from '@/ui/display/loader/components/Loader';
import { MainButton } from '@/ui/input/button/MainButton';
import { TextInput } from '@/ui/input/components/TextInput';

const StyledWrapper = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.noisy};
  display: flex;
  height: 100vh;
  justify-content: center;
`;

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.primary};
  width: 400px;
  height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledActionContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  width: 300px;
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  text-transform: uppercase;
`;

const Options = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [serverBaseUrl, setServerBaseUrl] = useState(
    import.meta.env.VITE_SERVER_BASE_URL,
  );
  const authenticate = () => {
    setIsAuthenticating(true);
    setError('');
    chrome.runtime.sendMessage({ action: 'CONNECT' }, ({ status, message }) => {
      if (status === true) {
        setIsAuthenticated(true);
        setIsAuthenticating(false);
        chrome.storage.local.set({ isAuthenticated: true });
      } else {
        setError(message);
        setIsAuthenticating(false);
      }
    });
  };

  useEffect(() => {
    const getState = async () => {
      const store = await chrome.storage.local.get();
      if (store.serverBaseUrl !== '') {
        setServerBaseUrl(store.serverBaseUrl);
      } else {
        setServerBaseUrl(import.meta.env.VITE_SERVER_BASE_URL);
      }

      if (store.isAuthenticated === true) setIsAuthenticated(true);
    };
    void getState();
  }, []);

  const handleBaseUrlChange = (value: string) => {
    setServerBaseUrl(value);
    setError('');
    chrome.storage.local.set({ serverBaseUrl: value });
  };

  return (
    <StyledWrapper>
      <StyledContainer>
        <img src="/logo/32-32.svg" alt="twenty-logo" height={64} width={64} />
        <StyledActionContainer>
          <TextInput
            label="Server URL"
            value={serverBaseUrl}
            onChange={handleBaseUrlChange}
            placeholder="My base server URL"
            error={error}
            fullWidth
          />
          {isAuthenticating ? (
            <Loader />
          ) : isAuthenticated ? (
            <StyledLabel>Connected!</StyledLabel>
          ) : (
            <>
              <MainButton
                title="Connect your account"
                onClick={() => authenticate()}
                fullWidth
              />
              <MainButton
                title="Sign up"
                variant="secondary"
                onClick={() => window.open(`${serverBaseUrl}`, '_blank')}
                fullWidth
              />
            </>
          )}
        </StyledActionContainer>
      </StyledContainer>
    </StyledWrapper>
  );
};

export default Options;
