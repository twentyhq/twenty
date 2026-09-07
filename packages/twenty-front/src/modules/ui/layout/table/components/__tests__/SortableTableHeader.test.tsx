import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { type TableSortValue } from '@/ui/layout/table/types/TableSortValue';

const renderHeader = (initialSort: TableSortValue) => {
  const store = createStore();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  const { container } = render(
    <SortableTableHeader
      tableId="test-table"
      fieldName="label"
      label="Name"
      initialSort={initialSort}
    />,
    { wrapper: Wrapper },
  );

  return {
    click: () => userEvent.click(screen.getByText('Name')),
    getArrowDirection: () => {
      if (isDefined(container.querySelector('.tabler-icon-arrow-up'))) {
        return 'asc';
      }

      return isDefined(container.querySelector('.tabler-icon-arrow-down'))
        ? 'desc'
        : 'none';
    },
  };
};

describe('SortableTableHeader', () => {
  it('reverses the arrow on the first click of an initially ascending column', async () => {
    const { click, getArrowDirection } = renderHeader({
      fieldName: 'label',
      direction: 'asc',
    });

    expect(getArrowDirection()).toBe('asc');

    await click();

    expect(getArrowDirection()).toBe('desc');
  });

  it('toggles the arrow back to ascending on the second click', async () => {
    const { click, getArrowDirection } = renderHeader({
      fieldName: 'label',
      direction: 'asc',
    });

    await click();
    await click();

    expect(getArrowDirection()).toBe('asc');
  });

  it('shows a descending arrow on the first click of an unsorted column', async () => {
    const { click, getArrowDirection } = renderHeader({
      fieldName: 'otherField',
      direction: 'asc',
    });

    expect(getArrowDirection()).toBe('none');

    await click();

    expect(getArrowDirection()).toBe('desc');
  });
});
