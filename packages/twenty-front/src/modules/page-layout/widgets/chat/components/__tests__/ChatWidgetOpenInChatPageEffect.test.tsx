import { render } from '@testing-library/react';

import { ChatWidgetOpenInChatPageEffect } from '@/page-layout/widgets/chat/components/ChatWidgetOpenInChatPageEffect';

const closeSidePanelMenu = jest.fn();
const projectAiChatThreadToUrl = jest.fn();

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu }),
}));

jest.mock('@/ai/hooks/useProjectAiChatThreadToUrl', () => ({
  useProjectAiChatThreadToUrl: () => ({ projectAiChatThreadToUrl }),
}));

const CHAT_ID = '20202020-0000-4000-8000-0000000000aa';

describe('ChatWidgetOpenInChatPageEffect', () => {
  it('closes the side panel and opens the chat in the chat page', () => {
    render(<ChatWidgetOpenInChatPageEffect threadId={CHAT_ID} />);

    expect(closeSidePanelMenu).toHaveBeenCalledTimes(1);
    expect(projectAiChatThreadToUrl).toHaveBeenCalledWith(CHAT_ID);
  });
});
