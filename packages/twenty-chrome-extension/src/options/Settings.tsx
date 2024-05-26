import { useEffect, useState } from 'react';
import styled from '@emotion/styled';

import { TextInput } from '@/ui/input/components/TextInput';
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

  useEffect(() => {
    const getState = async () => {
      const store = await chrome.storage.local.get();
      if (isDefined(store.serverBaseUrl)) {
        setServerBaseUrl(store.serverBaseUrl);
      } else {
        setServerBaseUrl(import.meta.env.VITE_SERVER_BASE_URL);
      }

      if (isDefined(store.clientUrl)) {
        setClientUrl(store.clientUrl);
      } else {
        setClientUrl(import.meta.env.VITE_FRONT_BASE_URL);
      }
    };
    void getState();
  }, []);

  const handleBaseUrlChange = (value: string) => {
    setServerBaseUrl(value);
    chrome.storage.local.set({ serverBaseUrl: value });
  };

  const handleClientUrlChange = (value: string) => {
    setClientUrl(value);
    chrome.storage.local.set({ clientUrl: value });
  };

  return (
    <StyledWrapper>
      <StyledContainer>
        <img src="/logo/32-32.svg" alt="twenty-logo" height={40} width={40} />
        <StyledActionContainer>
          <TextInput
            label="Client URL"
            value={clientUrl}
            onChange={handleClientUrlChange}
            placeholder="My client URL"
            fullWidth
          />
          <TextInput
            label="Server URL"
            value={serverBaseUrl}
            onChange={handleBaseUrlChange}
            placeholder="My server URL"
            fullWidth
          />
        </StyledActionContainer>
      </StyledContainer>
    </StyledWrapper>
  );
};

export default Settings;
