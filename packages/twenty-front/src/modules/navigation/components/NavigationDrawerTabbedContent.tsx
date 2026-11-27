import { NavigationDrawerInboxContent } from '@/inbox/components/NavigationDrawerInboxContent';
import { LegacyAiChatNavigationDrawerContent } from '@/legacy-ai-chat/components/LegacyAiChatNavigationDrawerContent';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

type NavigationDrawerTabbedContentProps = {
  showAiChatContent: boolean;
  shouldMountAiChatContent: boolean;
  navigationContent: ReactNode;
};

const StyledTabContent = styled.div<{ isHidden: boolean }>`
  display: ${({ isHidden }) => (isHidden ? 'none' : 'contents')};
`;

export const NavigationDrawerTabbedContent = ({
  showAiChatContent,
  shouldMountAiChatContent,
  navigationContent,
}: NavigationDrawerTabbedContentProps) => {
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  return (
    <>
      <StyledTabContent isHidden={showAiChatContent}>
        {navigationContent}
      </StyledTabContent>
      {shouldMountAiChatContent && (
        <StyledTabContent isHidden={!showAiChatContent}>
          {isAiChatInboxEnabled ? (
            <NavigationDrawerInboxContent />
          ) : (
            <LegacyAiChatNavigationDrawerContent />
          )}
        </StyledTabContent>
      )}
    </>
  );
};
