import { render } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { SidePanelAskAiHandoffEffect } from '@/side-panel/components/SidePanelAskAiHandoffEffect';

const openAskAiPage = jest.fn();
const onContinueChatFromFullWidth = jest.fn();

jest.mock('@/side-panel/hooks/useOpenAskAiPageInSidePanel', () => ({
  useOpenAskAiPageInSidePanel: () => ({ openAskAiPage }),
}));

const leaveChatPageFor = (pathname: string) => {
  const store = createStore();

  store.set(shouldContinueAiChatInSidePanelState.atom, true);

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

    expect(openAskAiPage).toHaveBeenCalledWith({ resetNavigationStack: true });
    expect(onContinueChatFromFullWidth).toHaveBeenCalled();
  });

  it.each(['/inbox', '/settings/profile'])(
    'closes the chat when leaving it for %s',
    (pathname) => {
      const store = leaveChatPageFor(pathname);

      expect(openAskAiPage).not.toHaveBeenCalled();
      expect(onContinueChatFromFullWidth).not.toHaveBeenCalled();
      expect(store.get(shouldContinueAiChatInSidePanelState.atom)).toBe(false);
    },
  );
});
