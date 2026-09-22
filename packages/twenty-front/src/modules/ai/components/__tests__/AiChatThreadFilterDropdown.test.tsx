import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { AiChatThreadFilterDropdown } from '@/ai/components/AiChatThreadFilterDropdown';
import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AGENT_CHAT_THREAD_GROUP_BY } from '@/ai/constants/AgentChatThreadGroupBy';
import { AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER } from '@/ai/constants/AgentChatThreadLastActivityFilter';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadGroupByState } from '@/ai/states/agentChatThreadGroupByState';
import { agentChatThreadLastActivityFilterState } from '@/ai/states/agentChatThreadLastActivityFilterState';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';

const renderFilterDropdown = () => {
  const store = createStore();
  store.set(
    agentChatThreadFilterStatusState.atom,
    AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE,
  );
  store.set(agentChatThreadGroupByState.atom, AGENT_CHAT_THREAD_GROUP_BY.DATE);
  store.set(
    agentChatThreadLastActivityFilterState.atom,
    AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.ALL,
  );

  render(
    <I18nProvider i18n={i18n}>
      <Provider store={store}>
        <AiChatThreadFilterDropdown />
      </Provider>
    </I18nProvider>,
  );

  return { store, user: userEvent.setup() };
};

describe('AiChatThreadFilterDropdown', () => {
  it('applies a filter, restores the trigger, and reopens at the root page', async () => {
    const { store, user } = renderFilterDropdown();
    const trigger = screen.getByRole('button', { name: 'Filter chats' });

    await user.click(trigger);
    await user.click(await screen.findByRole('menuitem', { name: /Status/ }));
    await user.click(await screen.findByRole('button', { name: 'Archived' }));

    expect(store.get(agentChatThreadFilterStatusState.atom)).toBe('archived');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    await waitFor(() => expect(store.get(focusStackState.atom)).toEqual([]));

    await user.click(trigger);
    expect(
      await screen.findByRole('menuitem', { name: /Status Archived/ }),
    ).toBeVisible();
    await user.click(screen.getByRole('menuitem', { name: 'Clear filters' }));
    expect(store.get(agentChatThreadFilterStatusState.atom)).toBe('active');
  });

  it('returns from a picker without changing its value and releases shortcut scope on dismissal', async () => {
    const { store, user } = renderFilterDropdown();
    await user.click(screen.getByRole('button', { name: 'Filter chats' }));
    await user.click(await screen.findByRole('menuitem', { name: /Group by/ }));
    expect(
      await screen.findByRole('button', { name: 'Date', pressed: true }),
    ).toBeVisible();
    expect(store.get(focusStackState.atom).at(-1)?.globalHotkeysConfig).toEqual(
      {
        enableGlobalHotkeysConflictingWithKeyboard: false,
        enableGlobalHotkeysWithModifiers: false,
      },
    );

    await user.click(screen.getByRole('button', { name: 'Group by' }));
    expect(
      await screen.findByRole('menuitem', { name: /Group by/ }),
    ).toHaveFocus();
    expect(store.get(agentChatThreadGroupByState.atom)).toBe('date');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(store.get(focusStackState.atom)).toEqual([]));
  });
});
