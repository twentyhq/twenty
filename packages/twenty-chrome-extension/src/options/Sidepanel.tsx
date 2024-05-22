import { useEffect, useState } from 'react';
import styled from '@emotion/styled';

import { Loader } from '@/ui/display/loader/components/Loader';
import { MainButton } from '@/ui/input/button/MainButton';
import { TextInput } from '@/ui/input/components/TextInput';
import { isDefined } from '~/utils/isDefined';

const StyledIframe = styled.iframe`
  display: block;
  width: 100%;
  height: 100vh;
  border: none;
`;

const StyledWrapper = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  display: flex;
  height: 100vh;
  justify-content: center;
`;

const StyledContainer = styled.div`
  width: 400px;
  height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(8)};
`;

const StyledActionContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  width: 300px;
`;

const Sidepanel = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [iframeSrc, setIframeSrc] = useState(
    import.meta.env.VITE_FRONT_BASE_URL,
  );
  const [error, setError] = useState('');
  const [serverBaseUrl, setServerBaseUrl] = useState('');
  const authenticate = () => {
    setIsAuthenticating(true);
    setError('');
    chrome.runtime.sendMessage(
      { action: 'launchOAuth' },
      ({ status, message }) => {
        if (status === true) {
          setIsAuthenticated(true);
          setIsAuthenticating(false);
          chrome.storage.local.set({ isAuthenticated: true });
        } else {
          setError(message);
          setIsAuthenticating(false);
        }
      },
    );
  };

  useEffect(() => {
    const getState = async () => {
      const store = await chrome.storage.local.get();
      if (isDefined(store.serverBaseUrl)) {
        setServerBaseUrl(store.serverBaseUrl);
      } else {
        setServerBaseUrl(import.meta.env.VITE_SERVER_BASE_URL);
      }

      if (store.isAuthenticated === true) setIsAuthenticated(true);
      const { tab: activeTab } = await chrome.runtime.sendMessage({
        action: 'getActiveTab',
      });

      if (
        isDefined(activeTab) &&
        isDefined(store[`sidepanelUrl_${activeTab.id}`])
      ) {
        const url = store[`sidepanelUrl_${activeTab.id}`];
        setIframeSrc(url);
      }
    };
    void getState();
  }, []);

  useEffect(() => {
    const handleBrowserEvents = ({ action }: { action: string }) => {
      if (action === 'changeSidepanelUrl') {
        setIframeSrc('');
      }
    };
    chrome.runtime.onMessage.addListener(handleBrowserEvents);

    return () => {
      chrome.runtime.onMessage.removeListener(handleBrowserEvents);
    };
  }, []);

  useEffect(() => {
    const getIframeState = async () => {
      const store = await chrome.storage.local.get();
      const { tab: activeTab } = await chrome.runtime.sendMessage({
        action: 'getActiveTab',
      });

      if (
        isDefined(activeTab) &&
        isDefined(store[`sidepanelUrl_${activeTab.id}`])
      ) {
        const url = store[`sidepanelUrl_${activeTab.id}`];
        setIframeSrc(url);
      }
    };
    void getIframeState();
  }, [iframeSrc]);

  const handleBaseUrlChange = (value: string) => {
    setServerBaseUrl(value);
    setError('');
    chrome.storage.local.set({ serverBaseUrl: value });
  };

  return isAuthenticated ? (
    <StyledIframe title="twenty-website" src={iframeSrc}></StyledIframe>
  ) : (
    <StyledWrapper>
      <StyledContainer>
        <img src="/logo/32-32.svg" alt="twenty-logo" height={40} width={40} />
        {isAuthenticating ? (
          <Loader />
        ) : (
          <StyledActionContainer>
            <TextInput
              label="Server URL"
              value={serverBaseUrl}
              onChange={handleBaseUrlChange}
              placeholder="My base server URL"
              error={error}
              fullWidth
            />
            <MainButton
              title="Connect your account"
              onClick={() => authenticate()}
              fullWidth
            />
            <MainButton
              title="Sign up"
              variant="secondary"
              onClick={() =>
                window.open(`${import.meta.env.VITE_FRONT_BASE_URL}`, '_blank')
              }
              fullWidth
            />
          </StyledActionContainer>
        )}
      </StyledContainer>
    </StyledWrapper>
  );
};

export default Sidepanel;
