import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { Button } from '@/ui/button/components/Button';
import { IconHelpCircle } from '@/ui/icon';

const StyledButtonContainer = styled.div`
  display: flex;
`;

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
  const currentUser = useRecoilValue(currentUserState);
  const supportChat = useRecoilValue(supportChatState);
  const [isFrontChatLoaded, setIsFrontChatLoaded] = useState(false);

  useEffect(() => {
    if (
      supportChat?.supportDriver === 'front' &&
      supportChat.supportFrontChatId &&
      !isFrontChatLoaded
    ) {
      configureFront(supportChat.supportFrontChatId);
      setIsFrontChatLoaded(true);
    }
    if (currentUser?.email && isFrontChatLoaded) {
      window.FrontChat?.('identity', {
        email: currentUser.email,
        name: currentUser.displayName,
        userHash: currentUser?.supportUserHash,
      });
    }
  }, [
    currentUser?.displayName,
    currentUser?.email,
    currentUser?.supportUserHash,
    isFrontChatLoaded,
    supportChat?.supportDriver,
    supportChat.supportFrontChatId,
  ]);

  function handleSupportClick() {
    if (supportChat?.supportDriver === 'front') {
      window.FrontChat?.('show');
    }
  }

  return isFrontChatLoaded ? (
    <StyledButtonContainer>
      <Button
        variant={'tertiary'}
        size={'small'}
        title="Support"
        Icon={IconHelpCircle}
        iconSize="md"
        onClick={handleSupportClick}
      />
    </StyledButtonContainer>
  ) : null;
}
