import { AiChatPageContinueInSidePanelEffect } from '@/ai/components/AiChatPageContinueInSidePanelEffect';
import { AiChatPageThreadLoadEffect } from '@/ai/components/AiChatPageThreadLoadEffect';

type AiChatPageEffectsProps = {
  threadId: string;
  isNewChat: boolean;
};

// What a chat shown on the main page needs, full page or in the inbox
export const AiChatPageEffects = ({
  threadId,
  isNewChat,
}: AiChatPageEffectsProps) => (
  <>
    {!isNewChat && (
      <AiChatPageThreadLoadEffect key={threadId} threadId={threadId} />
    )}
    <AiChatPageContinueInSidePanelEffect threadId={threadId} />
  </>
);
