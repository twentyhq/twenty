import { AiChatPageCloseSidePanelChatEffect } from '@/ai/components/AiChatPageCloseSidePanelChatEffect';
import { AiChatPageContinueInSidePanelEffect } from '@/ai/components/AiChatPageContinueInSidePanelEffect';
import { AiChatPageThreadUrlSyncEffect } from '@/ai/components/AiChatPageThreadUrlSyncEffect';

// What a chat shown on the main page needs, full page or in the inbox
export const AiChatPageEffects = () => (
  <>
    <AiChatPageThreadUrlSyncEffect />
    <AiChatPageCloseSidePanelChatEffect />
    <AiChatPageContinueInSidePanelEffect />
  </>
);
