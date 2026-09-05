import { NavigationDrawerAiChatContent } from '@/ai/components/NavigationDrawerAiChatContent';
import { NavigationDrawerInboxContent } from '@/inbox/components/NavigationDrawerInboxContent';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

type NavigationDrawerTabbedContentProps = {
  showAiChatContent: boolean;
  shouldMountAiChatContent: boolean;
  showInboxContent: boolean;
  shouldMountInboxContent: boolean;
  navigationContent: ReactNode;
};

const StyledTabContent = styled.div<{ isHidden: boolean }>`
  display: ${({ isHidden }) => (isHidden ? 'none' : 'contents')};
`;

// Every mode stays mounted once it has been shown, so switching back does not
// refetch its list and the polling it owns keeps running.
export const NavigationDrawerTabbedContent = ({
  showAiChatContent,
  shouldMountAiChatContent,
  showInboxContent,
  shouldMountInboxContent,
  navigationContent,
}: NavigationDrawerTabbedContentProps) => {
  return (
    <>
      <StyledTabContent
        key="navigation"
        isHidden={showAiChatContent || showInboxContent}
      >
        {navigationContent}
      </StyledTabContent>
      {shouldMountInboxContent && (
        <StyledTabContent key="inbox" isHidden={!showInboxContent}>
          <NavigationDrawerInboxContent />
        </StyledTabContent>
      )}
      {shouldMountAiChatContent && (
        <StyledTabContent key="ai-chat" isHidden={!showAiChatContent}>
          <NavigationDrawerAiChatContent />
        </StyledTabContent>
      )}
    </>
  );
};
