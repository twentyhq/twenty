import { AiChatPageCloseSidePanelChatEffect } from '@/ai/components/AiChatPageCloseSidePanelChatEffect';
import { AiChatPageContinueInSidePanelEffect } from '@/ai/components/AiChatPageContinueInSidePanelEffect';
import { AiChatPageThreadSelection } from '@/ai/components/AiChatPageThreadSelection';

// What a chat shown on the main page needs, full page or in the inbox
export const AiChatPageEffects = () => (
  <>
    <AiChatPageThreadSelection />
    <AiChatPageCloseSidePanelChatEffect />
    <AiChatPageContinueInSidePanelEffect />
  </>
);
