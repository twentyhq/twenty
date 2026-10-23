import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatUserCreditsExhaustedBanner } from '@/ai/components/AiChatUserCreditsExhaustedBanner';
import { agentChatUserCreditsExhaustedNoticeState } from '@/ai/states/agentChatUserCreditsExhaustedNoticeState';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const renderBanner = (
  notice: {
    renewsAt: string;
    isFallingBackToWorkspaceCredits: boolean;
  } | null,
) => {
  const store = createStore();

  store.set(agentChatUserCreditsExhaustedNoticeState.atom, notice);

  render(
    <JotaiProvider store={store}>
      <I18nProvider i18n={i18n}>
        <AiChatUserCreditsExhaustedBanner />
      </I18nProvider>
    </JotaiProvider>,
  );
};

describe('AiChatUserCreditsExhaustedBanner', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-10-23T12:00:00Z') });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('tells the member their chats now use workspace credits until renewal', () => {
    renderBanner({
      renewsAt: '2026-10-26T00:00:00Z',
      isFallingBackToWorkspaceCredits: true,
    });

    expect(
      screen.getByText(
        'You have used all your AI credits. Chats use workspace credits until yours renew in 3 days.',
      ),
    ).toBeVisible();
  });

  it('tells the member their chats stop until renewal', () => {
    renderBanner({
      renewsAt: '2026-10-26T00:00:00Z',
      isFallingBackToWorkspaceCredits: false,
    });

    expect(
      screen.getByText(
        'You have used all your AI credits. Chats stop until yours renew in 3 days.',
      ),
    ).toBeVisible();
  });

  it('goes away once dismissed', async () => {
    jest.useRealTimers();
    renderBanner({
      renewsAt: new Date(Date.now() + 3 * 86400000).toISOString(),
      isFallingBackToWorkspaceCredits: true,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(screen.queryByText(/AI credits/)).not.toBeInTheDocument();
  });

  it('renders nothing once the credits have renewed', () => {
    renderBanner({
      renewsAt: '2026-10-23T00:00:00Z',
      isFallingBackToWorkspaceCredits: true,
    });

    expect(screen.queryByText(/AI credits/)).not.toBeInTheDocument();
  });

  it('renders nothing without a notice', () => {
    renderBanner(null);

    expect(screen.queryByText(/AI credits/)).not.toBeInTheDocument();
  });
});
