import { InboxThreadPageCloseSidePanelChatEffect } from '@/ai/components/AiChatPageCloseSidePanelChatEffect';
import { InboxThreadPageContinueInSidePanelEffect } from '@/ai/components/AiChatPageContinueInSidePanelEffect';
import { InboxThreadPageThreadSelection } from '@/ai/components/AiChatPageThreadSelection';

// What a chat shown on the main page needs, full page or in the inbox
export const InboxThreadPageEffects = () => (
  <>
    <InboxThreadPageThreadSelection />
    <InboxThreadPageCloseSidePanelChatEffect />
    <InboxThreadPageContinueInSidePanelEffect />
  </>
);
