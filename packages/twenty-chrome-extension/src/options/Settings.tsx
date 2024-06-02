import { useEffect, useState } from 'react';
import styled from '@emotion/styled';

import { MainButton } from '@/ui/input/button/MainButton';
import { TextInput } from '@/ui/input/components/TextInput';
import { clearStore } from '~/utils/apolloClient';
import { isDefined } from '~/utils/isDefined';

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

const Settings = () => {
  const [serverBaseUrl, setServerBaseUrl] = useState('');
  const [clientUrl, setClientUrl] = useState('');
  const [currentClientUrl, setCurrentClientUrl] = useState('');
  const [currentServerUrl, setCurrentServerUrl] = useState('');

  useEffect(() => {
    const getState = async () => {
      const store = await chrome.storage.local.get([
        'serverBaseUrl',
        'clientUrl',
      ]);
      if (isDefined(store.serverBaseUrl)) {
        setServerBaseUrl(store.serverBaseUrl);
        setCurrentServerUrl(store.serverBaseUrl);
      } else {
        setServerBaseUrl(import.meta.env.VITE_SERVER_BASE_URL);
        setCurrentServerUrl(import.meta.env.VITE_SERVER_BASE_URL);
      }

      if (isDefined(store.clientUrl)) {
        setClientUrl(store.clientUrl);
        setCurrentClientUrl(store.clientUrl);
      } else {
        setClientUrl(import.meta.env.VITE_FRONT_BASE_URL);
        setCurrentClientUrl(import.meta.env.VITE_FRONT_BASE_URL);
      }
    };
    void getState();
  }, []);

  const handleSettingsChange = () => {
    chrome.storage.local.set({
      serverBaseUrl,
      clientUrl,
      navigateSidepanel: 'sidepanel',
    });
    clearStore();
  };

  const handleCloseSettings = () => {
    chrome.storage.local.set({
      navigateSidepanel: 'sidepanel',
    });
  };

  return (
    <StyledWrapper>
      <StyledContainer>
        <img src="/logo/32-32.svg" alt="twenty-logo" height={40} width={40} />
        <StyledActionContainer>
          <TextInput
            label="Client URL"
            value={clientUrl}
            onChange={setClientUrl}
            placeholder="My client URL"
            fullWidth
          />
          <TextInput
            label="Server URL"
            value={serverBaseUrl}
            onChange={setServerBaseUrl}
            placeholder="My server URL"
            fullWidth
          />
          <MainButton
            title="Done"
            disabled={
              currentClientUrl === clientUrl &&
              currentServerUrl === serverBaseUrl
            }
            variant="primary"
            onClick={handleSettingsChange}
            fullWidth
          />
          <MainButton
            title="Close"
            variant="secondary"
            onClick={handleCloseSettings}
            fullWidth
          />
        </StyledActionContainer>
      </StyledContainer>
    </StyledWrapper>
  );
};

export default Settings;
