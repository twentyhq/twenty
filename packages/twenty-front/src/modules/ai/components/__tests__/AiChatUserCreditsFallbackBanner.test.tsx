import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatUserCreditsFallbackBanner } from '@/ai/components/AiChatUserCreditsFallbackBanner';
import { agentChatUserCreditsFallbackNoticeState } from '@/ai/states/agentChatUserCreditsFallbackNoticeState';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const renderBanner = (notice: { renewsAt: string } | null) => {
  const store = createStore();

  store.set(agentChatUserCreditsFallbackNoticeState.atom, notice);

  render(
    <JotaiProvider store={store}>
      <I18nProvider i18n={i18n}>
        <AiChatUserCreditsFallbackBanner />
      </I18nProvider>
    </JotaiProvider>,
  );
};

describe('AiChatUserCreditsFallbackBanner', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-10-23T12:00:00Z') });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('tells the member their chats now use workspace credits until renewal', () => {
    renderBanner({ renewsAt: '2026-10-26T00:00:00Z' });

    expect(
      screen.getByText(
        'You have used all your AI credits. Chats use workspace credits until yours renew in 3 days.',
      ),
    ).toBeVisible();
  });

  it('goes away once dismissed', async () => {
    jest.useRealTimers();
    renderBanner({ renewsAt: '2026-10-26T00:00:00Z' });

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(screen.queryByText(/workspace credits/)).not.toBeInTheDocument();
  });

  it('renders nothing without a notice', () => {
    renderBanner(null);

    expect(screen.queryByText(/workspace credits/)).not.toBeInTheDocument();
  });
});
