import { NavigationDrawerAiChatContent } from '@/ai/components/NavigationDrawerAiChatContent';
import { styled } from '@linaria/react';
import { type ReactNode, useEffect, useState } from 'react';

type NavigationDrawerTabbedContentProps = {
  showAiChatContent: boolean;
  navigationContent: ReactNode;
};

const StyledTabContent = styled.div<{ isHidden: boolean }>`
  display: ${({ isHidden }) => (isHidden ? 'none' : 'contents')};
`;

// Both tabs stay mounted and toggle visibility so switching Home <-> Chat does
// not remount either subtree (which flashed the chat skeleton on every switch).
// The chat tab mounts lazily on first open, then stays mounted.
export const NavigationDrawerTabbedContent = ({
  showAiChatContent,
  navigationContent,
}: NavigationDrawerTabbedContentProps) => {
  const [hasOpenedAiChat, setHasOpenedAiChat] = useState(showAiChatContent);

  useEffect(() => {
    if (showAiChatContent) {
      setHasOpenedAiChat(true);
    }
  }, [showAiChatContent]);

  return (
    <>
      <StyledTabContent isHidden={showAiChatContent}>
        {navigationContent}
      </StyledTabContent>
      {hasOpenedAiChat && (
        <StyledTabContent isHidden={!showAiChatContent}>
          <NavigationDrawerAiChatContent />
        </StyledTabContent>
      )}
    </>
  );
};
