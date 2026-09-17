import { styled } from '@linaria/react';

import { AiChatChannelComposerEffect } from '@/ai/components/AiChatChannelComposerEffect';
import { AiChatEditorSection } from '@/ai/components/AiChatEditorSection';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledComposer = styled.div`
  --ai-chat-content-max-width: 768px;

  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 100%;
`;

type AiChatChannelComposerProps = {
  channelId: string;
};

export const AiChatChannelComposer = ({
  channelId,
}: AiChatChannelComposerProps) => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const threadIdCreatedFromDraft = useAtomStateValue(
    threadIdCreatedFromDraftState,
  );
  const draftKey = currentAiChatThread ?? AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
  // Typing creates the thread under the user, which must not remount the
  // editor they are typing in.
  const editorSectionKey =
    draftKey !== AGENT_CHAT_NEW_THREAD_DRAFT_KEY &&
    draftKey === threadIdCreatedFromDraft
      ? AGENT_CHAT_NEW_THREAD_DRAFT_KEY
      : draftKey;

  return (
    <AiChatSurfaceContext.Provider value={AI_CHAT_SURFACE.CHANNEL_PAGE}>
      <AiChatChannelComposerEffect channelId={channelId} />
      <StyledComposer>
        <AiChatEditorSection key={editorSectionKey} />
      </StyledComposer>
    </AiChatSurfaceContext.Provider>
  );
};
