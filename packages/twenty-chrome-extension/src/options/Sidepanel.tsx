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
    const store = await chrome.storage.local.get([
      'isAuthenticated',
      'sidepanelUrl',
      'clientUrl',
      'accessToken',
      'refreshToken',
    ]);

    if (
      store.isAuthenticated === true &&
      isDefined(store.accessToken) &&
      isDefined(store.refreshToken) &&
      new Date(store.accessToken.expiresAt).getTime() >= Date.now()
    ) {
      setIsAuthenticated(true);
      if (isDefined(store.sidepanelUrl)) {
        if (isDefined(store.clientUrl)) {
          setClientUrl(`${store.clientUrl}${store.sidepanelUrl}`);
        } else {
          setClientUrl(
            `${import.meta.env.VITE_FRONT_BASE_URL}${store.sidepanelUrl}`,
          );
        }
      }
    } else {
      chrome.storage.local.set({ isAuthenticated: false });
      if (isDefined(store.clientUrl)) {
        setClientUrl(store.clientUrl);
      }
    }
  }, [setClientUrl]);

  useEffect(() => {
    void setIframeState();
  }, [setIframeState]);

  useEffect(() => {
    window.addEventListener('message', async (event) => {
      const store = await chrome.storage.local.get([
        'clientUrl',
        'accessToken',
        'refreshToken',
      ]);
      const clientUrl = isDefined(store.clientUrl)
        ? store.clientUrl
        : import.meta.env.VITE_FRONT_BASE_URL;

      if (
        isDefined(store.accessToken) &&
        isDefined(store.refreshToken) &&
        event.origin === clientUrl &&
        event.data === 'loaded'
      ) {
        event.source?.postMessage(
          {
            type: 'tokens',
            value: {
              accessToken: {
                token: store.accessToken.token,
                expiresAt: store.accessToken.expiresAt,
              },
              refreshToken: {
                token: store.refreshToken.token,
                expiresAt: store.refreshToken.expiresAt,
              },
            },
          },
          clientUrl,
        );
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.onChanged.addListener(async (updatedStore) => {
      if (isDefined(updatedStore.isAuthenticated)) {
        if (updatedStore.isAuthenticated.newValue === true) {
          setIframeState();
        }
      }

      if (isDefined(updatedStore.sidepanelUrl)) {
        if (isDefined(updatedStore.sidepanelUrl.newValue)) {
          const store = await chrome.storage.local.get(['clientUrl']);
          const clientUrl = isDefined(store.clientUrl)
            ? store.clientUrl
            : import.meta.env.VITE_FRONT_BASE_URL;

          iframeRef.current?.contentWindow?.postMessage(
            {
              type: 'navigate',
              value: updatedStore.sidepanelUrl.newValue,
            },
            clientUrl,
          );
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
