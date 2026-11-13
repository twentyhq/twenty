import { act, renderHook } from '@testing-library/react';

import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useHandleToggleColumnSort } from '@/object-record/record-index/hooks/useHandleToggleColumnSort';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { isDefined } from 'twenty-shared/utils';
import { ViewSortDirection } from '~/generated-metadata/graphql';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';

const mockObjectMetadataItemNameSingular = 'company';

describe('useHandleToggleColumnSort', () => {
  const mockObjectMetadataItem = getTestEnrichedObjectMetadataItemsMock().find(
    (item) => item.nameSingular === mockObjectMetadataItemNameSingular,
  );

  if (!isDefined(mockObjectMetadataItem)) {
    throw new Error(
      `Missing mock object metadata item with name singular ${mockObjectMetadataItemNameSingular}`,
    );
  }

  const mockFieldMetadataItem = mockObjectMetadataItem.fields.find(
    (field) => field.name === 'name',
  );

  const otherFieldMetadataItem = mockObjectMetadataItem.fields.find(
    (field) => field.name === 'domainName',
  );

  if (!isDefined(mockFieldMetadataItem)) {
    throw new Error(`Missing mock field metadata Name`);
  }

  if (!isDefined(otherFieldMetadataItem)) {
    throw new Error(`Missing mock field metadata Domain Name`);
  }

  const renderHookWithSorts = (initialSorts: RecordSort[]) => {
    return renderHook(
      () => {
        const handleToggleColumnSort = useHandleToggleColumnSort({
          objectMetadataItemId: mockObjectMetadataItem.id,
        });

        const currentRecordSorts = useAtomComponentStateValue(
          currentRecordSortsComponentState,
        );

        return { handleToggleColumnSort, currentRecordSorts };
      },
      {
        wrapper: getJestMetadataAndApolloMocksAndCommandMenuWrapper({
          apolloMocks: [],
          componentInstanceId: 'instanceId',
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
          onInitializeJotaiStore: (store) => {
            store.set(
              currentRecordSortsComponentState.atomFamily({
                instanceId: 'recordIndexId',
              }),
              initialSorts,
            );
          },
        }),
      },
    );
  };

  it('should replace existing sorts when sorting by another column', () => {
    const existingSorts: RecordSort[] = [
      {
        id: 'sort-1',
        fieldMetadataId: mockFieldMetadataItem.id,
        direction: ViewSortDirection.ASC,
      },
    ];

    const { result } = renderHookWithSorts(existingSorts);

    act(() => {
      result.current.handleToggleColumnSort(otherFieldMetadataItem.id);
    });

    expect(result.current.currentRecordSorts).toHaveLength(1);
    expect(result.current.currentRecordSorts[0].fieldMetadataId).toBe(
      otherFieldMetadataItem.id,
    );
    expect(result.current.currentRecordSorts[0].direction).toBe(
      ViewSortDirection.ASC,
    );
  });

  it('should flip the direction when the column is already the primary sort', () => {
    const existingSorts: RecordSort[] = [
      {
        id: 'sort-1',
        fieldMetadataId: mockFieldMetadataItem.id,
        direction: ViewSortDirection.ASC,
      },
    ];

    const { result } = renderHookWithSorts(existingSorts);

    act(() => {
      result.current.handleToggleColumnSort(mockFieldMetadataItem.id);
    });

    expect(result.current.currentRecordSorts).toHaveLength(1);
    expect(result.current.currentRecordSorts[0]).toEqual({
      id: 'sort-1',
      fieldMetadataId: mockFieldMetadataItem.id,
      direction: ViewSortDirection.DESC,
    });
  });

  it('should drop secondary sort levels when sorting from a column header', () => {
    const existingSorts: RecordSort[] = [
      {
        id: 'sort-1',
        fieldMetadataId: mockFieldMetadataItem.id,
        direction: ViewSortDirection.ASC,
      },
      {
        id: 'sort-2',
        fieldMetadataId: otherFieldMetadataItem.id,
        direction: ViewSortDirection.DESC,
      },
    ];

    const { result } = renderHookWithSorts(existingSorts);

    act(() => {
      result.current.handleToggleColumnSort(otherFieldMetadataItem.id);
    });

    expect(result.current.currentRecordSorts).toHaveLength(1);
    expect(result.current.currentRecordSorts[0].fieldMetadataId).toBe(
      otherFieldMetadataItem.id,
    );
  });
});
