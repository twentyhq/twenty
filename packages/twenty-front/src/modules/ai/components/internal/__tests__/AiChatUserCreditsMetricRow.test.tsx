import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatUserCreditsMetricRow } from '@/ai/components/internal/AiChatUserCreditsMetricRow';
import { billingState } from '@/client-config/states/billingState';
import { GetAiChatUserCreditsUsageDocument } from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const renderRow = (
  aiChatUserCreditsUsage: {
    limitValue: number;
    consumedValue: number | null;
    periodEnd: string;
  } | null,
) => {
  const store = createStore();

  store.set(billingState.atom, { isBillingEnabled: true } as never);

  return render(
    <JotaiProvider store={store}>
      <MockedProvider
        mocks={[
          {
            request: { query: GetAiChatUserCreditsUsageDocument },
            result: {
              data: {
                aiChatUserCreditsUsage: aiChatUserCreditsUsage && {
                  __typename: 'AiChatUserCreditsUsage',
                  ...aiChatUserCreditsUsage,
                },
              },
            },
          },
        ]}
      >
        <I18nProvider i18n={i18n}>
          <AiChatUserCreditsMetricRow />
        </I18nProvider>
      </MockedProvider>
    </JotaiProvider>,
  );
};

describe('AiChatUserCreditsMetricRow', () => {
  beforeEach(() => {
    jest.useFakeTimers({
      now: new Date('2026-10-23T12:00:00Z'),
      doNotFake: ['setTimeout', 'queueMicrotask', 'nextTick', 'setImmediate'],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the user credits left this period and when they reset', async () => {
    renderRow({
      limitValue: 4160000,
      consumedValue: 1160000,
      periodEnd: '2026-10-26T00:00:00.000Z',
    });

    expect(await screen.findByText('Your credits')).toBeVisible();
    expect(screen.getByText('3 credits left, reset in 3 days')).toBeVisible();
    expect(
      screen.getByRole('progressbar', { name: 'Your credits' }),
    ).toHaveAttribute('aria-valuetext', '3 credits left, reset in 3 days');
  });

  it('renders nothing when the member has no user credits', async () => {
    const { container } = renderRow(null);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.queryByText('Your credits')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
