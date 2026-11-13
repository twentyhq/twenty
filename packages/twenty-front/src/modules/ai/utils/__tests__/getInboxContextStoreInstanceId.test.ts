import { getInboxContextStoreInstanceId } from '@/ai/utils/getInboxContextStoreInstanceId';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

describe('getInboxContextStoreInstanceId', () => {
  it('should follow the side panel when the chat takes the whole page', () => {
    expect(
      getInboxContextStoreInstanceId({
        isOnInboxThreadPage: true,
        isSidePanelOpened: true,
        currentSidePanelPageId: 'side-panel-page-1',
      }),
    ).toBe('side-panel-page-1');
  });

  it('should follow the main page when the chat sits in the side panel', () => {
    expect(
      getInboxContextStoreInstanceId({
        isOnInboxThreadPage: false,
        isSidePanelOpened: true,
        currentSidePanelPageId: 'side-panel-page-1',
      }),
    ).toBe(MAIN_CONTEXT_STORE_INSTANCE_ID);
  });

  it('should follow the main page when the chat page has no side panel open', () => {
    expect(
      getInboxContextStoreInstanceId({
        isOnInboxThreadPage: true,
        isSidePanelOpened: false,
        currentSidePanelPageId: undefined,
      }),
    ).toBe(MAIN_CONTEXT_STORE_INSTANCE_ID);
  });
});
