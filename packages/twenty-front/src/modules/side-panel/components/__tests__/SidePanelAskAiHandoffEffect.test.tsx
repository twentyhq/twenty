import { render } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

import { aiChatContinueInSidePanelThreadIdState } from '@/ai/states/aiChatContinueInSidePanelThreadIdState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { SidePanelAskAiHandoffEffect } from '@/side-panel/components/SidePanelAskAiHandoffEffect';

const openAskAiPage = jest.fn();
const onContinueChatFromFullWidth = jest.fn();

jest.mock('@/side-panel/hooks/useOpenAskAiPageInSidePanel', () => ({
  useOpenAskAiPageInSidePanel: () => ({ openAskAiPage }),
}));

const CONTINUED_THREAD_ID = '20202020-0000-4000-8000-000000000002';

const leaveChatPageFor = (
  pathname: string,
  continuedThreadId = CONTINUED_THREAD_ID,
) => {
  const store = createStore();

  store.set(aiChatContinueInSidePanelThreadIdState.atom, continuedThreadId);
  store.set(shouldOpenAiChatAfterOnboardingState.atom, true);

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[pathname]}>
        <SidePanelAskAiHandoffEffect
          onContinueChatFromFullWidth={onContinueChatFromFullWidth}
        />
      </MemoryRouter>
    </Provider>,
  );

  return store;
};

describe('SidePanelAskAiHandoffEffect', () => {
  beforeEach(() => {
    openAskAiPage.mockClear();
    onContinueChatFromFullWidth.mockClear();
  });

  it('continues the chat in the side panel when leaving it for a record', () => {
    leaveChatPageFor('/objects/companies');

    expect(openAskAiPage).toHaveBeenCalledWith({
      threadId: CONTINUED_THREAD_ID,
      resetNavigationStack: true,
    });
    expect(onContinueChatFromFullWidth).toHaveBeenCalled();
  });

  it('continues a new chat as the side panel new chat', () => {
    const store = createStore();
    const newAiChatThreadId = store.get(newAiChatThreadIdState.atom);

    store.set(aiChatContinueInSidePanelThreadIdState.atom, newAiChatThreadId);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/objects/companies']}>
          <SidePanelAskAiHandoffEffect
            onContinueChatFromFullWidth={onContinueChatFromFullWidth}
          />
        </MemoryRouter>
      </Provider>,
    );

    expect(openAskAiPage).toHaveBeenCalledWith({
      threadId: undefined,
      resetNavigationStack: true,
    });
  });

  it('closes the chat when leaving it for settings', () => {
    const store = leaveChatPageFor('/settings/profile');

    expect(openAskAiPage).not.toHaveBeenCalled();
    expect(onContinueChatFromFullWidth).not.toHaveBeenCalled();
    expect(store.get(aiChatContinueInSidePanelThreadIdState.atom)).toBeNull();
  });

  it.each(['/inbox', '/inbox/20202020-0000-4000-8000-000000000001'])(
    'leaves the chat to the page it moves to on %s',
    (pathname) => {
      const store = leaveChatPageFor(pathname);

      expect(openAskAiPage).not.toHaveBeenCalled();
      expect(store.get(aiChatContinueInSidePanelThreadIdState.atom)).toBe(
        CONTINUED_THREAD_ID,
      );
      expect(store.get(shouldOpenAiChatAfterOnboardingState.atom)).toBe(false);
    },
  );
});
