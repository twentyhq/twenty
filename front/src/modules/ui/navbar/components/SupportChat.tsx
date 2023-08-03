import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { useGetClientConfigQuery } from '~/generated/graphql';

const StyledButtonContainer = styled.div`
  display: flex;
`;

const StyledQuestionMark = styled.div`
  align-items: center;
  border-radius: 50%;
  border-style: solid;
  border-width: ${({ theme }) => theme.spacing(0.25)};
  display: flex;
  height: ${({ theme }) => theme.spacing(3.5)};
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing(1)};
  width: ${({ theme }) => theme.spacing(3.5)};
`;

const StyledButton = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  :hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
    color: ${({ theme }) => theme.font.color.secondary};
  }
  font-weight: ${({ theme }) => theme.font.weight.regular};
  padding: ${({ theme }) => theme.spacing(2)};
`;

// insert a script tag into the DOM right before the closing body tag
function insertScript(scriptSrc: string) {
  const script = document.createElement('script');
  script.src = scriptSrc;

  document.body.appendChild(script);
}

function configureFront(chatId: string) {
  const url = 'https://chat-assets.frontapp.com/v1/chat.bundle.js';
  // check if Front Chat script is already loaded
  const script = document.querySelector(`script[src="${url}"]`);

  if (!script) {
    // insert script and initialize Front Chat when script is loaded
    insertScript(url);
    window.FrontChat?.('init', { chatId, useDefaultLauncher: false });
  }
}

export default function SupportChat() {
  const [supportChatConfig, setSupportChatConfig] =
    useRecoilState(supportChatState);
  const user = useRecoilValue(currentUserState);
  const [isFrontChatLoaded, setIsFrontChatLoaded] = useState(false);

  const { data, loading } = useGetClientConfigQuery({
    variables: { email: user?.email },
  });

  useEffect(() => {
    if (!loading && data?.clientConfig) {
      setSupportChatConfig(data?.clientConfig.supportChat);
    }
  }, [data, loading, setSupportChatConfig]);

  useEffect(() => {
    if (
      supportChatConfig.supportDriver === 'front' &&
      supportChatConfig.supportFrontendKey &&
      !isFrontChatLoaded
    ) {
      configureFront(supportChatConfig.supportFrontendKey);
      setIsFrontChatLoaded(true);
    }
  }, [
    isFrontChatLoaded,
    supportChatConfig.supportDriver,
    supportChatConfig.supportFrontendKey,
  ]);

  useEffect(() => {
    const email = user?.email;
    const displayName = user?.displayName;
    const userHash = supportChatConfig.supportHMACKey;
    if (userHash && email && isFrontChatLoaded) {
      window.FrontChat?.('identity', {
        email,
        ...(displayName ? { name: displayName } : {}),
        userHash,
        customFields: {},
      });
    }
  }, [
    isFrontChatLoaded,
    supportChatConfig.supportFrontendKey,
    supportChatConfig.supportHMACKey,
    user?.displayName,
    user?.email,
  ]);

  function handleSupportClick() {
    if (supportChatConfig.supportDriver === 'front') window.FrontChat?.('show');
  }

  return isFrontChatLoaded ? (
    <StyledButtonContainer>
      <StyledButton>
        <StyledQuestionMark>?</StyledQuestionMark>
        <div onClick={handleSupportClick}>Support</div>
      </StyledButton>
    </StyledButtonContainer>
  ) : null;
}
