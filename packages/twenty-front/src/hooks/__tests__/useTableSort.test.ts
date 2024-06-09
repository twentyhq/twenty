import { act, renderHook } from '@testing-library/react';

import {
  mockedTableData as tableData,
  tableDataSortedByFieldsCountInAscendingOrder,
  tableDataSortedByFieldsCountInDescendingOrder,
  tableDataSortedBylabelInAscendingOrder,
  tableDataSortedBylabelInDescendingOrder,
} from '~/testing/mock-data/tableData';

import { useTableSort } from '../useTableSort';

describe('useTableSort hook', () => {
  test('initial sorting behavior for string fields', () => {
    const { result } = renderHook(() => useTableSort('labelPlural', tableData));
    const [sortedData, , sortConfig] = result.current;

    expect(JSON.stringify(sortedData)).toBe(
      JSON.stringify(tableDataSortedBylabelInAscendingOrder),
    );
    expect(sortConfig).toEqual({
      sortByColumnKey: 'labelPlural',
      sortOrder: 'ascending',
    });
  });

  test('initial sorting behavior for number fields', () => {
    const { result } = renderHook(() => useTableSort('fieldsCount', tableData));
    const [sortedData, , sortConfig] = result.current;

    expect(JSON.stringify(sortedData)).toBe(
      JSON.stringify(tableDataSortedByFieldsCountInAscendingOrder),
    );
    expect(sortConfig).toEqual({
      sortByColumnKey: 'fieldsCount',
      sortOrder: 'ascending',
    });
  });

  test('sorting behavior when clicking on string column header', () => {
    const { result } = renderHook(() => useTableSort('fieldsCount', tableData));
    const [, handleSortClick] = result.current;

    act(() => {
      handleSortClick('labelPlural');
    });

    let [sortedData, , sortConfig] = result.current;

    expect(JSON.stringify(sortedData)).toBe(
      JSON.stringify(tableDataSortedBylabelInAscendingOrder),
    );
    expect(sortConfig).toEqual({
      sortByColumnKey: 'labelPlural',
      sortOrder: 'ascending',
    });

    act(() => {
      handleSortClick('labelPlural');
    });

    [sortedData, , sortConfig] = result.current;

    expect(JSON.stringify(sortedData)).toBe(
      JSON.stringify(tableDataSortedBylabelInDescendingOrder),
    );
    expect(sortConfig).toEqual({
      sortByColumnKey: 'labelPlural',
      sortOrder: 'descending',
    });
  });

  test('sorting behavior when clicking on number column header', () => {
    const { result } = renderHook(() => useTableSort('labelPlural', tableData));
    const [, handleSortClick] = result.current;

    act(() => {
      handleSortClick('fieldsCount');
    });

    let [sortedData, , sortConfig] = result.current;

    expect(JSON.stringify(sortedData)).toBe(
      JSON.stringify(tableDataSortedByFieldsCountInAscendingOrder),
    );
    expect(sortConfig).toEqual({
      sortByColumnKey: 'fieldsCount',
      sortOrder: 'ascending',
    });

    act(() => {
      handleSortClick('fieldsCount');
    });

    [sortedData, , sortConfig] = result.current;

    expect(JSON.stringify(sortedData)).toBe(
      JSON.stringify(tableDataSortedByFieldsCountInDescendingOrder),
    );
    expect(sortConfig).toEqual({
      sortByColumnKey: 'fieldsCount',
      sortOrder: 'descending',
    });
  });
});
