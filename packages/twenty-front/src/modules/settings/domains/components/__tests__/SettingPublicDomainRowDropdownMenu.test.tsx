import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { SettingPublicDomainRowDropdownMenu } from '@/settings/domains/components/SettingPublicDomainRowDropdownMenu';

const deletePublicDomain = jest.fn();
const refetchPublicDomains = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: () => [deletePublicDomain],
  useQuery: () => ({ refetch: refetchPublicDomains }),
}));

jest.mock('twenty-ui/components', () => ({
  ...jest.requireActual('twenty-ui/components'),
  useToast: () => ({ enqueueToast: jest.fn() }),
}));

it('keeps the domain action open until deletion completes, then closes and refetches', async () => {
  const user = userEvent.setup();
  let finishDeletion = () => {};
  deletePublicDomain.mockReturnValue(
    new Promise<void>((resolve) => {
      finishDeletion = resolve;
    }),
  );

  render(
    <I18nProvider i18n={i18n}>
      <Provider store={createStore()}>
        <SettingPublicDomainRowDropdownMenu
          publicDomain={{
            id: 'public-domain',
            domain: 'crm.example.com',
            createdAt: '2026-09-23T00:00:00.000Z',
            isValidated: true,
          }}
        />
      </Provider>
    </I18nProvider>,
  );

  const trigger = screen.getByRole('button', { name: 'More options' });
  await user.click(trigger);
  await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));

  expect(deletePublicDomain).toHaveBeenCalledWith(
    expect.objectContaining({ variables: { domain: 'crm.example.com' } }),
  );
  expect(screen.getByRole('menu')).toBeVisible();
  expect(refetchPublicDomains).not.toHaveBeenCalled();

  await act(async () => finishDeletion());

  await waitFor(() =>
    expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
  );
  expect(refetchPublicDomains).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(trigger).toHaveFocus());
});
