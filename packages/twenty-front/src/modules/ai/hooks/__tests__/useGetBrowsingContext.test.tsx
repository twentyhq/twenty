import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useGetBrowsingContext } from '@/ai/hooks/useGetBrowsingContext';

describe('useGetBrowsingContext', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('describes a settings page by its path', () => {
    window.history.pushState(
      {},
      '',
      '/settings/objects/opportunities/validation-rules/rule-1',
    );
    const store = createStore();

    const { result } = renderHook(() => useGetBrowsingContext(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <JotaiProvider store={store}>{children}</JotaiProvider>
      ),
    });

    expect(result.current.getBrowsingContext()).toEqual({
      type: 'settingsPage',
      path: '/settings/objects/opportunities/validation-rules/rule-1',
    });
  });
});
