import { NavigationDrawerAiChatContent } from '@/ai/components/NavigationDrawerAiChatContent';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

type NavigationDrawerTabbedContentProps = {
  showAiChatContent: boolean;
  shouldRenderAiChatContent: boolean;
  navigationContent: ReactNode;
};

const StyledTabContent = styled.div<{ isHidden: boolean }>`
  display: ${({ isHidden }) => (isHidden ? 'none' : 'contents')};
`;

export const NavigationDrawerTabbedContent = ({
  showAiChatContent,
  shouldRenderAiChatContent,
  navigationContent,
}: NavigationDrawerTabbedContentProps) => {
  return (
    <>
      <StyledTabContent isHidden={showAiChatContent}>
        {navigationContent}
      </StyledTabContent>
      {shouldRenderAiChatContent && (
        <StyledTabContent isHidden={!showAiChatContent}>
          <NavigationDrawerAiChatContent />
        </StyledTabContent>
      )}
    </>
  );
};
