import { getAiChatContextStoreInstanceId } from '@/ai/utils/getAiChatContextStoreInstanceId';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

describe('getAiChatContextStoreInstanceId', () => {
  it('should follow the side panel when the chat takes the whole page', () => {
    expect(
      getAiChatContextStoreInstanceId({
        isOnAiChatPage: true,
        isSidePanelOpened: true,
        currentSidePanelPageId: 'side-panel-page-1',
      }),
    ).toBe('side-panel-page-1');
  });

  it('should follow the main page when the chat sits in the side panel', () => {
    expect(
      getAiChatContextStoreInstanceId({
        isOnAiChatPage: false,
        isSidePanelOpened: true,
        currentSidePanelPageId: 'side-panel-page-1',
      }),
    ).toBe(MAIN_CONTEXT_STORE_INSTANCE_ID);
  });

  it('should follow the main page when the chat page has no side panel open', () => {
    expect(
      getAiChatContextStoreInstanceId({
        isOnAiChatPage: true,
        isSidePanelOpened: false,
        currentSidePanelPageId: undefined,
      }),
    ).toBe(MAIN_CONTEXT_STORE_INSTANCE_ID);
  });
});
