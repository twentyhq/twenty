import { AiChatPageContinueInSidePanelEffect } from '@/ai-chat/components/AiChatPageContinueInSidePanelEffect';
import { AiChatPageThreadLoadEffect } from '@/ai-chat/instance/components/AiChatPageThreadLoadEffect';
import { AiChatThreadOpenViewEffect } from '@/ai-chat/threads/components/AiChatThreadOpenViewEffect';

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
    <AiChatThreadOpenViewEffect threadId={threadId} />
  </>
);
