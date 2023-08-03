import { useEffect } from 'react';
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
  border-width: 1px;
  display: flex;
  font-size: 10px;
  height: 10px;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing(1)};
  padding: 1px;
  width: 10px;
`;

const StyledButton = styled.button`
  background-color: ${({ theme }) => theme.background.transparent.light};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  padding: ${({ theme }) => theme.spacing(1.3)};
  :hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

// insert a script tag into the DOM right before the closing body tag
function insertScript(scriptSrc: string) {
  const script = document.createElement('script');
  script.src = scriptSrc;

  document.body.appendChild(script);
}

function configureFront(config: Record<string, unknown>) {
  // insert script and initialize Front Chat when script is loaded
  insertScript('https://chat-assets.frontapp.com/v1/chat.bundle.js');

  window.FrontChat?.('init', config);
}

export default function SupportChat() {
  const [supportChatConfig, setSupportChatConfig] =
    useRecoilState(supportChatState);
  const user = useRecoilValue(currentUserState);

  const { data, loading } = useGetClientConfigQuery({
    variables: { email: user?.email },
  });

  useEffect(() => {
    if (!loading && data?.clientConfig) {
      setSupportChatConfig(data?.clientConfig.supportChat);
    }
  }, [data, loading, setSupportChatConfig]);

  useEffect(() => {
    const email = user?.email;
    const displayName = user?.displayName;
    const userHash = supportChatConfig.supportHMACKey;
    if (
      supportChatConfig.supportDriver === 'front' &&
      supportChatConfig.supportFrontendKey
    ) {
      configureFront({
        chatId: supportChatConfig.supportFrontendKey,
        useDefaultLauncher: false,
        ...(email ? { email } : {}),
        ...(displayName ? { name: displayName } : {}),
        ...(userHash ? { userHash } : {}),
        customFields: {},
      });
    }
  }, [
    supportChatConfig.supportDriver,
    supportChatConfig.supportFrontendKey,
    supportChatConfig.supportHMACKey,
    user?.displayName,
    user?.email,
  ]);

  function handleSupportClick() {
    if (supportChatConfig.supportDriver === 'front') window.FrontChat?.('show');
  }

  return (
    <StyledButtonContainer>
      <StyledButton>
        <StyledQuestionMark>?</StyledQuestionMark>
        <div onClick={handleSupportClick}>Support</div>
      </StyledButton>
    </StyledButtonContainer>
  );
}
