import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { type ComponentProps, type ReactNode } from 'react';

import { SettingsObjectFieldInactiveActionDropdown } from '@/settings/data-model/object-details/components/SettingsObjectFieldDisabledActionDropdown';
import { TableRow } from '@/ui/layout/table/components/TableRow';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <Provider store={createStore()}>{children}</Provider>
  </I18nProvider>
);

it('keeps activation inside the row menu and restores focus while the request is pending', async () => {
  const user = userEvent.setup();
  const onRowClick = jest.fn();
  const onActivate = jest.fn(() => new Promise<void>(() => {}));

  render(
    <TableRow onClick={onRowClick}>
      <SettingsObjectFieldInactiveActionDropdown
        fieldMetadataItemId="test-field"
        isCustomField
        onActivate={onActivate}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    </TableRow>,
    { wrapper: Wrapper },
  );

  const trigger = screen.getByRole('button', {
    name: 'Inactive Field Options',
  });
  await user.click(trigger);

  expect(
    screen.getAllByRole('menuitem').map((item) => item.textContent),
  ).toEqual(['Edit', 'Activate', 'Delete']);

  await user.click(screen.getByRole('menuitem', { name: 'Activate' }));

  expect(onActivate).toHaveBeenCalledTimes(1);
  expect(onRowClick).not.toHaveBeenCalled();
  await waitFor(() =>
    expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
  );
  await waitFor(() => expect(trigger).toHaveFocus());
});

it.each<{
  name: string;
  props: Partial<
    ComponentProps<typeof SettingsObjectFieldInactiveActionDropdown>
  >;
  actions: string[];
}>([
  {
    name: 'read-only field',
    props: { isCustomField: true, readonly: true },
    actions: ['View'],
  },
  {
    name: 'system field',
    props: { isCustomField: true, isSystemField: true },
    actions: ['Edit', 'Activate'],
  },
])('preserves the allowed actions for a $name', async ({ props, actions }) => {
  const user = userEvent.setup();
  render(
    <SettingsObjectFieldInactiveActionDropdown
      fieldMetadataItemId="test-field"
      isCustomField={props.isCustomField}
      isSystemField={props.isSystemField}
      readonly={props.readonly}
      onActivate={jest.fn()}
      onEdit={jest.fn()}
      onDelete={jest.fn()}
    />,
    { wrapper: Wrapper },
  );

  await user.click(
    screen.getByRole('button', { name: 'Inactive Field Options' }),
  );

  expect(
    screen.getAllByRole('menuitem').map((item) => item.textContent),
  ).toEqual(actions);
});
