import React, { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { MutableSnapshot, RecoilRoot } from 'recoil';

import { tableSortFamilyState } from '@/activities/states/tabelSortFamilyState';
import { OrderBy } from '@/object-metadata/types/OrderBy';
import {
  mockedTableData as tableData,
  tableDataSortedByFieldsCountInAscendingOrder,
  tableDataSortedByFieldsCountInDescendingOrder,
  tableDataSortedBylabelInAscendingOrder,
  tableDataSortedBylabelInDescendingOrder,
} from '~/testing/mock-data/tableData';

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
        tableSortFamilyState({
          tableId: 'SettingsObjectDetail',
          initialFieldName: 'labelPlural',
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
          initialFieldName: 'labelPlural',
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
          initialFieldName: 'labelPlural',
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
          initialFieldName: 'labelPlural',
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
          initialFieldName: 'labelPlural',
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
