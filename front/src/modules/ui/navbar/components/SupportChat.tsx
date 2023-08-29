import { useEffect, useState } from 'react';
import { useTheme } from '@emotion/react';
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
  const theme = useTheme();
  const user = useRecoilValue(currentUserState);
  const supportChatConfig = useRecoilValue(supportChatState);
  const [isFrontChatLoaded, setIsFrontChatLoaded] = useState(false);

  useEffect(() => {
    if (
      supportChatConfig?.supportDriver === 'front' &&
      supportChatConfig.supportFrontChatId &&
      !isFrontChatLoaded
    ) {
      configureFront(supportChatConfig.supportFrontChatId);
      setIsFrontChatLoaded(true);
    }
    if (user?.email && isFrontChatLoaded) {
      window.FrontChat?.('identity', {
        email: user.email,
        name: user.displayName,
        userHash: user?.supportUserHash,
      });
    }
  }, [
    isFrontChatLoaded,
    supportChatConfig?.supportDriver,
    supportChatConfig.supportFrontChatId,
    user?.displayName,
    user?.email,
    user?.supportUserHash,
  ]);

  function handleSupportClick() {
    if (supportChatConfig?.supportDriver === 'front') {
      window.FrontChat?.('show');
    }
  }

  return isFrontChatLoaded ? (
    <StyledButtonContainer>
      <Button
        variant={'tertiary'}
        size={'small'}
        title="Support"
        icon={<IconHelpCircle size={theme.icon.size.md} />}
        onClick={handleSupportClick}
      />
    </StyledButtonContainer>
  ) : null;
}
