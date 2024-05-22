import { useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';

import { MainButton } from '@/ui/input/button/MainButton';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientUrl, setClientUrl] = useState(
    import.meta.env.VITE_FRONT_BASE_URL,
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const setIframeState = useCallback(async () => {
    const store = await chrome.storage.local.get();
    if (isDefined(store.isAuthenticated)) setIsAuthenticated(true);
    const { tab: activeTab } = await chrome.runtime.sendMessage({
      action: 'getActiveTab',
    });

    if (
      isDefined(activeTab) &&
      isDefined(store[`sidepanelUrl_${activeTab.id}`])
    ) {
      const url = store[`sidepanelUrl_${activeTab.id}`];
      setClientUrl(url);
    } else if (isDefined(store.clientUrl)) {
      setClientUrl(store.clientUrl);
    }
  }, [setClientUrl]);

  useEffect(() => {
    const initState = async () => {
      const store = await chrome.storage.local.get();
      if (isDefined(store.isAuthenticated)) setIsAuthenticated(true);
      void setIframeState();
    };
    void initState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void setIframeState();
  }, [setIframeState, clientUrl]);

  useEffect(() => {
    chrome.storage.local.onChanged.addListener((store) => {
      if (isDefined(store.isAuthenticated)) {
        if (store.isAuthenticated.newValue === true) {
          setIframeState();
        }
      }
    });
  }, [setIframeState]);

  return isAuthenticated ? (
    <StyledIframe
      ref={iframeRef}
      title="twenty-website"
      src={clientUrl}
    ></StyledIframe>
  ) : (
    <StyledWrapper>
      <StyledContainer>
        <img src="/logo/32-32.svg" alt="twenty-logo" height={40} width={40} />
        <StyledActionContainer>
          <MainButton
            title="Connect your account"
            fullWidth
            onClick={() => {
              window.open(clientUrl, '_blank');
            }}
          />
        </StyledActionContainer>
      </StyledContainer>
    </StyledWrapper>
  );
};

export default Sidepanel;
