import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@/ui/button/components/Button';
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

// insert a script tag into the DOM right before the closing body tag
function insertScript({
  src,
  innerHTML,
  onLoad,
}: {
  src?: string;
  innerHTML?: string;
  onLoad?: (...args: any[]) => void;
}) {
  const script = document.createElement('script');
  if (src) script.src = src;
  if (innerHTML) script.innerHTML = innerHTML;
  if (onLoad) script.onload = onLoad;
  document.body.appendChild(script);
}

function configureFront(chatId: string) {
  const url = 'https://chat-assets.frontapp.com/v1/chat.bundle.js';
  // check if Front Chat script is already loaded
  const script = document.querySelector(`script[src="${url}"]`);

  if (!script) {
    // insert script and initialize Front Chat when it loads
    insertScript({
      src: url,
      onLoad: () => {
        window.FrontChat?.('init', {
          chatId,
          useDefaultLauncher: false,
        });
      },
    });
  }
}

export default function SupportChat() {
  const user = useRecoilValue(currentUserState);
  const [isFrontChatLoaded, setIsFrontChatLoaded] = useState(false);
  const [isChatShowing, setIsChatShowing] = useState(false);

  const { data, loading } = useGetClientConfigQuery({
    variables: { email: user?.email },
  });

  const supportChatConfig = data?.clientConfig.supportChat;

  useEffect(() => {
    if (
      supportChatConfig?.supportDriver === 'front' &&
      supportChatConfig.supportFrontendKey &&
      !isFrontChatLoaded
    ) {
      configureFront(supportChatConfig.supportFrontendKey);
      setIsFrontChatLoaded(true);
    }
  }, [
    isFrontChatLoaded,
    supportChatConfig?.supportDriver,
    supportChatConfig?.supportFrontendKey,
  ]);

  useEffect(() => {
    const email = user?.email;
    if (!loading && email && isFrontChatLoaded) {
      window.FrontChat?.('identity', {
        email,
        name: user?.displayName,
        userHash: supportChatConfig?.supportHMACKey,
      });
    }
  }, [
    isFrontChatLoaded,
    supportChatConfig?.supportFrontendKey,
    supportChatConfig?.supportHMACKey,
    user?.displayName,
    user?.email,
    loading,
  ]);

  function handleSupportClick() {
    if (supportChatConfig?.supportDriver === 'front') {
      const action = isChatShowing ? 'hide' : 'show';
      setIsChatShowing(!isChatShowing);
      window.FrontChat?.(action);
    }
  }

  return isFrontChatLoaded ? (
    <StyledButtonContainer>
      <Button
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        title="Support"
        icon={<StyledQuestionMark>?</StyledQuestionMark>}
        onClick={handleSupportClick}
      />
    </StyledButtonContainer>
  ) : null;
}
