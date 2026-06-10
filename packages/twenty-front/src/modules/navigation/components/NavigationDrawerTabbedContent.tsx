import { NavigationDrawerAiChatContent } from '@/ai/components/NavigationDrawerAiChatContent';
import { styled } from '@linaria/react';
import { type ReactNode, useState } from 'react';

type NavigationDrawerTabbedContentProps = {
  showAiChatContent: boolean;
  navigationContent: ReactNode;
};

const StyledTabContent = styled.div<{ isHidden: boolean }>`
  display: ${({ isHidden }) => (isHidden ? 'none' : 'contents')};
`;

export const NavigationDrawerTabbedContent = ({
  showAiChatContent,
  navigationContent,
}: NavigationDrawerTabbedContentProps) => {
  const [hasOpenedAiChat, setHasOpenedAiChat] = useState(showAiChatContent);

  if (showAiChatContent && !hasOpenedAiChat) {
    setHasOpenedAiChat(true);
  }

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
