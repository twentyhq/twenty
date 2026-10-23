import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { SettingsBillingUserCreditsSection } from '@/settings/billing/components/SettingsBillingUserCreditsSection';
import {
  GetAiChatUserCreditsUsageDocument,
  UpdateUserCreditsFallbackDocument,
  UserCreditsFallback,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: jest.fn() }),
}));

const BILLING_CUSTOMER_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const renderSection = ({
  hasUserCredits,
  userCreditsFallback,
}: {
  hasUserCredits: boolean;
  userCreditsFallback: UserCreditsFallback;
}) => {
  const store = createStore();

  store.set(currentWorkspaceState.atom, {
    id: 'workspace',
    billingCustomer: {
      id: BILLING_CUSTOMER_ID,
      hasPaymentMethod: true,
      userCreditsFallback,
    },
  } as CurrentWorkspace);

  render(
    <JotaiProvider store={store}>
      <MockedProvider
        mocks={[
          {
            request: { query: GetAiChatUserCreditsUsageDocument },
            result: {
              data: {
                aiChatUserCreditsUsage: hasUserCredits
                  ? {
                      __typename: 'AiChatUserCreditsUsage',
                      limitValue: 4160000,
                      consumedValue: 0,
                      periodEnd: '2026-10-26T00:00:00.000Z',
                    }
                  : null,
              },
            },
          },
          {
            request: {
              query: UpdateUserCreditsFallbackDocument,
              variables: { userCreditsFallback: UserCreditsFallback.STOP },
            },
            result: {
              data: {
                updateUserCreditsFallback: {
                  __typename: 'BillingCustomer',
                  id: BILLING_CUSTOMER_ID,
                  userCreditsFallback: UserCreditsFallback.STOP,
                },
              },
            },
          },
        ]}
      >
        <I18nProvider i18n={i18n}>
          <SettingsBillingUserCreditsSection />
        </I18nProvider>
      </MockedProvider>
    </JotaiProvider>,
  );

  return store;
};

describe('SettingsBillingUserCreditsSection', () => {
  beforeAll(() => {
    // jsdom has no PointerEvent, which the switch dispatches on click
    window.PointerEvent ??= MouseEvent as typeof PointerEvent;
  });

  it('lets a billing admin stop chats once a member runs out of credits', async () => {
    const store = renderSection({
      hasUserCredits: true,
      userCreditsFallback: UserCreditsFallback.WORKSPACE_CREDITS,
    });

    const toggle = await screen.findByRole('switch', {
      name: 'Use workspace credits when a member runs out',
    });

    expect(toggle).toBeChecked();

    await userEvent.click(toggle);

    await waitFor(() =>
      expect(
        store.get(currentWorkspaceState.atom)?.billingCustomer
          ?.userCreditsFallback,
      ).toBe(UserCreditsFallback.STOP),
    );
    expect(toggle).not.toBeChecked();
  });

  it('stays hidden when the plan gives members no credits', async () => {
    renderSection({
      hasUserCredits: false,
      userCreditsFallback: UserCreditsFallback.WORKSPACE_CREDITS,
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.queryByText('User credits')).not.toBeInTheDocument();
  });
});
