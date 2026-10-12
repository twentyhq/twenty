import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useGetBrowsingContext } from '@/ai/hooks/useGetBrowsingContext';
import { aiChatOpenFormState } from '@/ai/states/aiChatOpenFormState';

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

  it('adds the open form, without its fill handler', () => {
    window.history.pushState(
      {},
      '',
      '/settings/objects/companies/new-validation-rule',
    );
    const store = createStore();
    const openForm = {
      formId: 'form-1',
      description: 'Validation rule on the Company object',
      fields: [{ name: 'name', description: 'Short rule name' }],
    };

    store.set(aiChatOpenFormState.atom, { ...openForm, onFill: jest.fn() });

    const { result } = renderHook(() => useGetBrowsingContext(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <JotaiProvider store={store}>{children}</JotaiProvider>
      ),
    });

    expect(result.current.getBrowsingContext()).toEqual({
      type: 'settingsPage',
      path: '/settings/objects/companies/new-validation-rule',
      openForm,
    });
  });
});
