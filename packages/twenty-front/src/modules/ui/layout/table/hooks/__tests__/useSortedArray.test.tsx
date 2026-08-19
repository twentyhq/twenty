import { renderHook } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { createStore, Provider } from 'jotai';

import {
  mockedTableMetadata,
  type MockedTableType,
  mockedTableData as tableData,
  tableDataSortedByFieldsCountInAscendingOrder,
  tableDataSortedByFieldsCountInDescendingOrder,
  tableDataSortedBylabelInAscendingOrder,
  tableDataSortedBylabelInDescendingOrder,
} from '~/testing/mock-data/tableData';

import { msg } from '@lingui/core/macro';
import { type OrderBy } from 'twenty-shared/types';
import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';

import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';

const createSortedWrapper = (
  fieldName: keyof MockedTableType,
  orderBy: OrderBy,
) => {
  const store = createStore();
  store.set(
    sortedFieldByTableFamilyState.atomFamily({
      tableId: mockedTableMetadata.tableId,
    }),
    {
      fieldName: fieldName as string,
      orderBy,
    },
  );
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return Wrapper;
};

describe('useSortedArray hook', () => {
  test('initial sorting behavior for string fields - Ascending', () => {
    const { result } = renderHook(
      () => useSortedArray(tableData, mockedTableMetadata),
      {
        wrapper: createSortedWrapper('labelPlural', 'AscNullsLast'),
      },
    );

    const sortedData = result.current;

    expect(sortedData).toEqual(tableDataSortedBylabelInAscendingOrder);
  });

  test('initial sorting behavior for string fields - Descending', () => {
    const { result } = renderHook(
      () => useSortedArray(tableData, mockedTableMetadata),
      {
        wrapper: createSortedWrapper('labelPlural', 'DescNullsLast'),
      },
    );

    const sortedData = result.current;

    expect(sortedData).toEqual(tableDataSortedBylabelInDescendingOrder);
  });

  test('initial sorting behavior for number fields - Ascending', () => {
    const { result } = renderHook(
      () => useSortedArray(tableData, mockedTableMetadata),
      {
        wrapper: createSortedWrapper('fieldsCount', 'AscNullsLast'),
      },
    );

    const sortedData = result.current;

    expect(sortedData).toEqual(tableDataSortedByFieldsCountInAscendingOrder);
  });

  test('initial sorting behavior for number fields - Descending', () => {
    const { result } = renderHook(
      () => useSortedArray(tableData, mockedTableMetadata),
      {
        wrapper: createSortedWrapper('fieldsCount', 'DescNullsLast'),
      },
    );

    const sortedData = result.current;

    expect(sortedData).toEqual(tableDataSortedByFieldsCountInDescendingOrder);
  });

  test('sorting behavior for date fields - Ascending', () => {
    const dateTableMetadata = {
      tableId: 'dateTable',
      fields: [
        {
          fieldLabel: msg`Updated at`,
          fieldName: 'updatedAt' as const,
          fieldType: 'date' as const,
          align: 'left' as const,
        },
      ],
    };
    const dateData = [
      { updatedAt: '2026-03-01T00:00:00.000Z' },
      { updatedAt: '2026-01-01T00:00:00.000Z' },
      { updatedAt: '2026-02-01T00:00:00.000Z' },
    ];

    const store = createStore();
    store.set(
      sortedFieldByTableFamilyState.atomFamily({ tableId: 'dateTable' }),
      { fieldName: 'updatedAt', orderBy: 'AscNullsLast' },
    );

    const { result } = renderHook(
      () => useSortedArray(dateData, dateTableMetadata),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <Provider store={store}>{children}</Provider>
        ),
      },
    );

    expect(result.current.map((item) => item.updatedAt)).toEqual([
      '2026-01-01T00:00:00.000Z',
      '2026-02-01T00:00:00.000Z',
      '2026-03-01T00:00:00.000Z',
    ]);
  });

  test('sorting behavior for date fields - Descending', () => {
    const dateTableMetadata = {
      tableId: 'dateTableDesc',
      fields: [
        {
          fieldLabel: msg`Updated at`,
          fieldName: 'updatedAt' as const,
          fieldType: 'date' as const,
          align: 'left' as const,
        },
      ],
    };
    const dateData = [
      { updatedAt: '2026-01-01T00:00:00.000Z' },
      { updatedAt: '2026-03-01T00:00:00.000Z' },
      { updatedAt: '2026-02-01T00:00:00.000Z' },
    ];

    const store = createStore();
    store.set(
      sortedFieldByTableFamilyState.atomFamily({ tableId: 'dateTableDesc' }),
      { fieldName: 'updatedAt', orderBy: 'DescNullsLast' },
    );

    const { result } = renderHook(
      () => useSortedArray(dateData, dateTableMetadata),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <Provider store={store}>{children}</Provider>
        ),
      },
    );

    expect(result.current.map((item) => item.updatedAt)).toEqual([
      '2026-03-01T00:00:00.000Z',
      '2026-02-01T00:00:00.000Z',
      '2026-01-01T00:00:00.000Z',
    ]);
  });
});
