import { NavigationDrawerInboxContent } from '@/ai/components/NavigationDrawerAiChatContent';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

type NavigationDrawerTabbedContentProps = {
  showInboxContent: boolean;
  shouldMountInboxContent: boolean;
  navigationContent: ReactNode;
};

const StyledTabContent = styled.div<{ isHidden: boolean }>`
  display: ${({ isHidden }) => (isHidden ? 'none' : 'contents')};
`;

export const NavigationDrawerTabbedContent = ({
  showInboxContent,
  shouldMountInboxContent,
  navigationContent,
}: NavigationDrawerTabbedContentProps) => {
  return (
    <>
      <StyledTabContent isHidden={showInboxContent}>
        {navigationContent}
      </StyledTabContent>
      {shouldMountInboxContent && (
        <StyledTabContent isHidden={!showInboxContent}>
          <NavigationDrawerInboxContent />
        </StyledTabContent>
      )}
    </>
  );
};
