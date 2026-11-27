import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { settingsExpressionDraftState } from '@/ai-chat/states/settingsExpressionDraftState';
import { useSettingsExpressionDraft } from '@/validation-rules/hooks/useSettingsExpressionDraft';

describe('useSettingsExpressionDraft', () => {
  it('should store the typed expression and clear it on unmount', () => {
    const store = createStore();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>{children}</JotaiProvider>
    );

    const { result, unmount } = renderHook(
      () => useSettingsExpressionDraft('formula'),
      { wrapper },
    );

    act(() => result.current.setExpressionDraft('amount * 2'));

    expect(store.get(settingsExpressionDraftState.atom)).toEqual({
      kind: 'formula',
      expression: 'amount * 2',
    });

    unmount();

    expect(store.get(settingsExpressionDraftState.atom)).toBeNull();
  });
});
