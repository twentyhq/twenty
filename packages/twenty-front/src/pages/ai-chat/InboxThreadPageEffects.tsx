import { InboxThreadPageCloseSidePanelChatEffect } from '@/ai/components/InboxThreadPageCloseSidePanelChatEffect';
import { InboxThreadPageContinueInSidePanelEffect } from '@/ai/components/InboxThreadPageContinueInSidePanelEffect';
import { InboxThreadPageThreadSelection } from '@/ai/components/InboxThreadPageThreadSelection';

// What a chat shown on the main page needs, full page or in the inbox
export const InboxThreadPageEffects = () => (
  <>
    <InboxThreadPageThreadSelection />
    <InboxThreadPageCloseSidePanelChatEffect />
    <InboxThreadPageContinueInSidePanelEffect />
  </>
);
