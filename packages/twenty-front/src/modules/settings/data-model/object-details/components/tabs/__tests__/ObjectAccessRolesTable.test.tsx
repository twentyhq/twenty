import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { ObjectAccessRolesTable } from '@/settings/data-model/object-details/components/tabs/ObjectAccessRolesTable';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const buildRole = (
  overrides: Partial<Parameters<typeof ObjectAccessRolesTable>[0]['roles'][0]>,
) => ({
  id: 'role-id',
  label: 'Role',
  icon: null,
  canRead: false,
  canUpdate: false,
  canSoftDelete: false,
  canDestroy: false,
  hasRowFilter: false,
  canAccessAllRecords: false,
  ...overrides,
});

describe('ObjectAccessRolesTable', () => {
  it('links each role to its settings and flags the ones with a row filter', () => {
    render(
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <ObjectAccessRolesTable
            roles={[
              buildRole({
                id: 'sales-role-id',
                label: 'Sales',
                canRead: true,
                hasRowFilter: true,
              }),
              buildRole({ id: 'guest-role-id', label: 'Guest' }),
            ]}
          />
        </MemoryRouter>
      </I18nProvider>,
    );

    expect(screen.getByRole('link', { name: /Sales/ })).toHaveAttribute(
      'href',
      expect.stringContaining('sales-role-id'),
    );
    expect(screen.getByRole('link', { name: /Guest/ })).toHaveAttribute(
      'href',
      expect.stringContaining('guest-role-id'),
    );
    expect(screen.getAllByText('Some records')).toHaveLength(1);
  });
});
