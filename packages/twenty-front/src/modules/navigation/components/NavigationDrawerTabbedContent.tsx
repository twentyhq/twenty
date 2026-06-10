import { NavigationDrawerAiChatContent } from '@/ai/components/NavigationDrawerAiChatContent';
import { styled } from '@linaria/react';
import { type ReactNode, useState } from 'react';

type NavigationDrawerTabbedContentProps = {
  showAiChatContent: boolean;
  navigationContent: ReactNode;
};

const StyledTabContent = styled.div`
  display: contents;

  &[data-hidden='true'] {
    display: none;
  }
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
      <StyledTabContent data-hidden={showAiChatContent}>
        {navigationContent}
      </StyledTabContent>
      {hasOpenedAiChat && (
        <StyledTabContent data-hidden={!showAiChatContent}>
          <NavigationDrawerAiChatContent />
        </StyledTabContent>
      )}
    </>
  );
};
