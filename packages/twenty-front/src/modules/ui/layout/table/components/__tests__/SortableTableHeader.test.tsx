import { fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';
import { type TableSortValue } from '@/ui/layout/table/types/TableSortValue';

const TABLE_ID = 'test-table';

const renderHeader = ({
  initialSort,
  fieldName = 'label',
}: {
  initialSort?: TableSortValue;
  fieldName?: string;
}) => {
  const store = createStore();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  render(
    <SortableTableHeader
      tableId={TABLE_ID}
      fieldName={fieldName}
      label="Name"
      initialSort={initialSort}
    />,
    { wrapper: Wrapper },
  );

  return {
    click: () => fireEvent.click(screen.getByText('Name')),
    getSortValue: () =>
      store.get(
        sortedFieldByTableFamilyState.atomFamily({ tableId: TABLE_ID }),
      ),
  };
};

describe('SortableTableHeader', () => {
  it('reverses the direction on the first click of an initially ascending column', () => {
    const { click, getSortValue } = renderHeader({
      initialSort: { fieldName: 'label', direction: 'asc' },
    });

    click();

    expect(getSortValue()).toEqual({ fieldName: 'label', direction: 'desc' });
  });

  it('toggles back to ascending on the second click', () => {
    const { click, getSortValue } = renderHeader({
      initialSort: { fieldName: 'label', direction: 'asc' },
    });

    click();
    click();

    expect(getSortValue()).toEqual({ fieldName: 'label', direction: 'asc' });
  });

  it('sorts descending first when the column is not the sorted one', () => {
    const { click, getSortValue } = renderHeader({
      initialSort: { fieldName: 'otherField', direction: 'asc' },
    });

    click();

    expect(getSortValue()).toEqual({ fieldName: 'label', direction: 'desc' });
  });
});
