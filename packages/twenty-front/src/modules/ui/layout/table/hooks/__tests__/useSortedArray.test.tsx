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

import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';
import { type ArraySortDirection } from 'twenty-shared/types';

import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';

const createSortedWrapper = (
  fieldName: keyof MockedTableType,
  direction: ArraySortDirection,
) => {
  const store = createStore();
  store.set(
    sortedFieldByTableFamilyState.atomFamily({
      tableId: mockedTableMetadata.tableId,
    }),
    {
      fieldName: fieldName as string,
      direction,
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
        wrapper: createSortedWrapper('labelPlural', 'asc'),
      },
    );

    const sortedData = result.current;

    expect(sortedData).toEqual(tableDataSortedBylabelInAscendingOrder);
  });

  test('initial sorting behavior for string fields - Descending', () => {
    const { result } = renderHook(
      () => useSortedArray(tableData, mockedTableMetadata),
      {
        wrapper: createSortedWrapper('labelPlural', 'desc'),
      },
    );

    const sortedData = result.current;

    expect(sortedData).toEqual(tableDataSortedBylabelInDescendingOrder);
  });

  test('initial sorting behavior for number fields - Ascending', () => {
    const { result } = renderHook(
      () => useSortedArray(tableData, mockedTableMetadata),
      {
        wrapper: createSortedWrapper('fieldsCount', 'asc'),
      },
    );

    const sortedData = result.current;

    expect(sortedData).toEqual(tableDataSortedByFieldsCountInAscendingOrder);
  });

  test('initial sorting behavior for number fields - Descending', () => {
    const { result } = renderHook(
      () => useSortedArray(tableData, mockedTableMetadata),
      {
        wrapper: createSortedWrapper('fieldsCount', 'desc'),
      },
    );

    const sortedData = result.current;

    expect(sortedData).toEqual(tableDataSortedByFieldsCountInDescendingOrder);
  });
});
