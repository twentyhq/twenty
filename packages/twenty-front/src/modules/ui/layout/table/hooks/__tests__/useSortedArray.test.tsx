import { renderHook } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { type MutableSnapshot, RecoilRoot } from 'recoil';

import {
  mockedTableMetadata,
  type MockedTableType,
  mockedTableData as tableData,
  tableDataSortedByFieldsCountInAscendingOrder,
  tableDataSortedByFieldsCountInDescendingOrder,
  tableDataSortedBylabelInAscendingOrder,
  tableDataSortedBylabelInDescendingOrder,
} from '~/testing/mock-data/tableData';

import { type OrderBy } from '@/types/OrderBy';
import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';

import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';

interface WrapperProps {
  children: ReactNode;
  initializeState?: (mutableSnapshot: MutableSnapshot) => void;
}

const Wrapper: React.FC<WrapperProps> = ({ children, initializeState }) => (
  <RecoilRoot initializeState={initializeState}>{children}</RecoilRoot>
);

describe('useSortedArray hook', () => {
  const initializeState =
    (fieldName: keyof MockedTableType, orderBy: OrderBy) =>
    ({ set }: MutableSnapshot) => {
      set(
        sortedFieldByTableFamilyState({
          tableId: mockedTableMetadata.tableId,
        }),
        {
          fieldName,
          orderBy,
        },
      );
    };

  test('initial sorting behavior for string fields - Ascending', () => {
    const { result } = renderHook(
      () => useSortedArray(tableData, mockedTableMetadata),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <Wrapper
            initializeState={initializeState('labelPlural', 'AscNullsLast')}
          >
            {children}
          </Wrapper>
        ),
      },
    );

    const sortedData = result.current;

    expect(sortedData).toEqual(tableDataSortedBylabelInAscendingOrder);
  });

  test('initial sorting behavior for string fields - Descending', () => {
    const { result } = renderHook(
      () => useSortedArray(tableData, mockedTableMetadata),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <Wrapper
            initializeState={initializeState('labelPlural', 'DescNullsLast')}
          >
            {children}
          </Wrapper>
        ),
      },
    );

    const sortedData = result.current;

    expect(sortedData).toEqual(tableDataSortedBylabelInDescendingOrder);
  });

  test('initial sorting behavior for number fields - Ascending', () => {
    const { result } = renderHook(
      () => useSortedArray(tableData, mockedTableMetadata),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <Wrapper
            initializeState={initializeState('fieldsCount', 'AscNullsLast')}
          >
            {children}
          </Wrapper>
        ),
      },
    );

    const sortedData = result.current;

    expect(sortedData).toEqual(tableDataSortedByFieldsCountInAscendingOrder);
  });

  test('initial sorting behavior for number fields - Descending', () => {
    const { result } = renderHook(
      () => useSortedArray(tableData, mockedTableMetadata),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <Wrapper
            initializeState={initializeState('fieldsCount', 'DescNullsLast')}
          >
            {children}
          </Wrapper>
        ),
      },
    );

    const sortedData = result.current;

    expect(sortedData).toEqual(tableDataSortedByFieldsCountInDescendingOrder);
  });
});
