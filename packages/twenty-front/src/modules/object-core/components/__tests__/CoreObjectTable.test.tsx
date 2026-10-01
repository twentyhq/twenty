import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { msg } from '@lingui/core/macro';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { messages } from '~/locales/generated/en';
import { CoreObjectTable } from '@/object-core/components/CoreObjectTable';
import { type CoreObjectTableColumn } from '@/object-core/types/CoreObjectTableColumn';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

type Item = { id: string; name: string };

const items: Item[] = [
  { id: 'item-1', name: 'Alpha' },
  { id: 'item-2', name: 'Beta' },
];

const columns: CoreObjectTableColumn<Item>[] = [
  {
    fieldName: 'name',
    fieldLabel: msg`Name`,
    fieldType: 'string',
    gridTrack: '1fr',
    renderCell: (item) => item.name,
  },
];

describe('CoreObjectTable', () => {
  it('clears the selection when a column header is clicked to sort', async () => {
    const onToggleAllRows = jest.fn();

    render(
      <JotaiProvider store={jotaiStore}>
        <I18nProvider i18n={i18n}>
          <CoreObjectTable
            tableId="core-object-table-test"
            columns={columns}
            items={items}
            getItemKey={(item) => item.id}
            selection={{
              selectedRowIds: ['item-2'],
              onToggleRow: jest.fn(),
              onToggleAllRows,
            }}
          />
        </I18nProvider>
      </JotaiProvider>,
    );

    await userEvent.click(screen.getByText('Name'));

    expect(onToggleAllRows).toHaveBeenCalledWith([]);
  });
});
