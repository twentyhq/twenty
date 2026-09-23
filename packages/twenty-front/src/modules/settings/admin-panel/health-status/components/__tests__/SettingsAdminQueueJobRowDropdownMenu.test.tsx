import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { SettingsAdminQueueJobRowDropdownMenu } from '@/settings/admin-panel/health-status/components/SettingsAdminQueueJobRowDropdownMenu';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { JobState } from '~/generated-admin/graphql';

it('retries a failed job without expanding its row and restores focus', async () => {
  const user = userEvent.setup();
  const onRowClick = jest.fn();
  const onRetry = jest.fn();
  const store = createStore();

  render(
    <I18nProvider i18n={i18n}>
      <Provider store={store}>
        <TableRow onClick={onRowClick}>
          <SettingsAdminQueueJobRowDropdownMenu
            jobId="failed-job"
            jobState={JobState.FAILED}
            onRetry={onRetry}
            onDelete={jest.fn()}
          />
        </TableRow>
      </Provider>
    </I18nProvider>,
  );

  const trigger = screen.getByRole('button', { name: 'Job Actions' });
  await user.click(trigger);
  await user.click(await screen.findByRole('menuitem', { name: 'Retry' }));

  expect(onRetry).toHaveBeenCalledTimes(1);
  expect(onRowClick).not.toHaveBeenCalled();
  await waitFor(() =>
    expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
  );
  await waitFor(() => expect(trigger).toHaveFocus());
  await waitFor(() => expect(store.get(focusStackState.atom)).toEqual([]));
});
