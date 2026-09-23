import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { SettingsAdminServerAdminAccess } from '@/settings/admin-panel/components/SettingsAdminServerAdminAccess';

const openDialog = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: () => [jest.fn()],
  useQuery: () => ({
    data: {
      getServerAdmins: [
        {
          id: 'last-admin',
          canAccessFullAdminPanel: true,
          canImpersonate: true,
        },
      ],
    },
    refetch: jest.fn(),
  }),
}));

jest.mock('@/settings/admin-panel/apollo/hooks/useApolloAdminClient', () => ({
  useApolloAdminClient: () => undefined,
}));

jest.mock('@/ui/layout/dialog/hooks/useDialog', () => ({
  useDialog: () => ({ openDialog }),
}));

jest.mock('@/ui/layout/dialog/components/ConfirmationDialog', () => ({
  ConfirmationDialog: () => null,
}));

jest.mock('twenty-ui/components', () => ({
  ...jest.requireActual('twenty-ui/components'),
  useToast: () => ({ enqueueToast: jest.fn() }),
}));

it('protects the last admin while allowing another access change and closing the menu', async () => {
  const user = userEvent.setup();

  render(
    <I18nProvider i18n={i18n}>
      <Provider store={createStore()}>
        <SettingsAdminServerAdminAccess
          userId="last-admin"
          userLabel="Last admin"
        />
      </Provider>
    </I18nProvider>,
  );

  await user.click(screen.getByRole('button', { name: 'More options' }));
  const revokeAdminAccess = await screen.findByRole('menuitem', {
    name: 'Revoke admin panel access',
  });

  expect(revokeAdminAccess).toHaveAttribute('aria-disabled', 'true');
  await user.click(revokeAdminAccess);
  expect(openDialog).not.toHaveBeenCalled();
  expect(screen.getByRole('menu')).toBeVisible();

  await user.click(
    screen.getByRole('menuitem', { name: 'Disable impersonation' }),
  );

  expect(openDialog).toHaveBeenCalledTimes(1);
  await waitFor(() =>
    expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
  );
});
