import { NavigationDrawerAiChatThreadSection } from '@/ai/components/NavigationDrawerAiChatThreadSection';
import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

const MOBILE_HOME_AI_CHAT_SECTION_ID = 'MobileHomeAiChat';

const StyledFetchMoreTrigger = styled.div`
  height: 1px;
  min-height: 1px;
  width: 100%;
`;

export const MobileHomeAiChatSection = () => {
  const { t } = useLingui();

  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const { handleThreadClick } = useAiChatThreadClick({
    resetNavigationStack: true,
  });
  const { threads, hasNextPage, fetchMoreRef } = useChatThreads();

  if (threads.length === 0) {
    return null;
  }

  return (
    <>
      <NavigationDrawerAiChatThreadSection
        sectionId={MOBILE_HOME_AI_CHAT_SECTION_ID}
        title={t`Conversations`}
        threads={threads}
        currentThreadId={currentAiChatThread}
        onThreadClick={handleThreadClick}
      />
      {hasNextPage ? <StyledFetchMoreTrigger ref={fetchMoreRef} /> : null}
    </>
  );
};
