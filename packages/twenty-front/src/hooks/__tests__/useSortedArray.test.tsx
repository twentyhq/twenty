import { renderHook } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { MutableSnapshot, RecoilRoot } from 'recoil';

import {
  mockedTableData as tableData,
  tableDataSortedByFieldsCountInAscendingOrder,
  tableDataSortedByFieldsCountInDescendingOrder,
  tableDataSortedBylabelInAscendingOrder,
  tableDataSortedBylabelInDescendingOrder,
} from '~/testing/mock-data/tableData';

import { OrderBy } from '@/types/OrderBy';
import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';
import { useSortedArray } from '../useSortedArray';

interface WrapperProps {
  children: ReactNode;
  initializeState?: (mutableSnapshot: MutableSnapshot) => void;
}

const Wrapper: React.FC<WrapperProps> = ({ children, initializeState }) => (
  <RecoilRoot initializeState={initializeState}>{children}</RecoilRoot>
);

describe('useSortedArray hook', () => {
  const initializeState =
    (fieldName: string, orderBy: OrderBy) =>
    ({ set }: MutableSnapshot) => {
      set(
        sortedFieldByTableFamilyState({
          tableId: 'SettingsObjectDetail',
        }),
        {
          fieldName,
          orderBy,
        },
      );
    };

  test('initial sorting behavior for string fields - Ascending', () => {
    const { result } = renderHook(
      () =>
        useSortedArray(tableData, {
          tableId: 'SettingsObjectDetail',
          fields: [],
        }),
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
      () =>
        useSortedArray(tableData, {
          tableId: 'SettingsObjectDetail',
          fields: [],
        }),
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
      () =>
        useSortedArray(tableData, {
          tableId: 'SettingsObjectDetail',
          fields: [],
        }),
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
      () =>
        useSortedArray(tableData, {
          tableId: 'SettingsObjectDetail',
          fields: [],
        }),
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
