import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsBillingUserCreditsSection } from '@/settings/billing/components/SettingsBillingUserCreditsSection';
import {
  PermissionFlagType,
  UpdateUserCreditsFallbackDocument,
  UserCreditsFallback,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: jest.fn() }),
}));

const BILLING_CUSTOMER_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const renderSection = ({
  hasUserCredits,
  hasBillingPermission = true,
  userCreditsFallback,
}: {
  hasUserCredits: boolean;
  hasBillingPermission?: boolean;
  userCreditsFallback: UserCreditsFallback;
}) => {
  const store = createStore();

  store.set(currentUserWorkspaceState.atom, {
    permissionFlags: hasBillingPermission ? [PermissionFlagType.BILLING] : [],
    twoFactorAuthenticationMethodSummary: [],
    objectsPermissions: [],
    isImpersonating: false,
  });

  store.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    currentBillingSubscription: {
      ...mockCurrentWorkspace.currentBillingSubscription,
      hasUserCredits,
    },
    billingCustomer: {
      id: BILLING_CUSTOMER_ID,
      hasPaymentMethod: true,
      userCreditsFallback,
    },
  });

  render(
    <JotaiProvider store={store}>
      <MockedProvider
        mocks={[
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

  it.each([
    { hasUserCredits: false, hasBillingPermission: true },
    { hasUserCredits: true, hasBillingPermission: false },
  ])('stays hidden with %o', ({ hasUserCredits, hasBillingPermission }) => {
    renderSection({
      hasUserCredits,
      hasBillingPermission,
      userCreditsFallback: UserCreditsFallback.WORKSPACE_CREDITS,
    });

    expect(screen.queryByText('User credits')).not.toBeInTheDocument();
  });
});
