import { act, renderHook } from '@testing-library/react';

import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import { ViewSortDirection } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { useHandleToggleColumnSort } from '@/object-record/record-index/hooks/useHandleToggleColumnSort';

const mockObjectMetadataItemNameSingular = 'company';

const RECORD_INDEX_ID = 'recordIndexId';

describe('useHandleToggleColumnSort', () => {
  const mockObjectMetadataItem = getTestEnrichedObjectMetadataItemsMock().find(
    (item) => item.nameSingular === mockObjectMetadataItemNameSingular,
  );

  if (!isDefined(mockObjectMetadataItem)) {
    throw new Error(
      `Missing mock object metadata item with name singular "${mockObjectMetadataItemNameSingular}"`,
    );
  }

  const firstField = mockObjectMetadataItem.fields.find(
    (field) => field.name === 'name',
  );
  const secondField = mockObjectMetadataItem.fields.find(
    (field) => field.name === 'domainName',
  );

  if (!isDefined(firstField) || !isDefined(secondField)) {
    throw new Error('Missing mock fields for testing');
  }

  it('should set single ASC sort when no sorts exist', () => {
    const { result } = renderHook(
      () => {
        const handleToggleColumnSort = useHandleToggleColumnSort({
          objectMetadataItemId: mockObjectMetadataItem.id,
        });

        const currentRecordSorts = useAtomComponentStateValue(
          currentRecordSortsComponentState,
          RECORD_INDEX_ID,
        );

        return { handleToggleColumnSort, currentRecordSorts };
      },
      {
        wrapper: getJestMetadataAndApolloMocksAndCommandMenuWrapper({
          apolloMocks: [],
          componentInstanceId: 'instanceId',
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
        }),
      },
    );

    act(() => {
      result.current.handleToggleColumnSort(firstField.id);
    });

    expect(result.current.currentRecordSorts).toEqual([
      expect.objectContaining({
        fieldMetadataId: firstField.id,
        direction: ViewSortDirection.ASC,
      }),
    ]);
  });

  it('should toggle direction to DESC when the clicked column is already the sole sort', () => {
    const initialSort: RecordSort = {
      id: 'sort-1',
      fieldMetadataId: firstField.id,
      direction: ViewSortDirection.ASC,
    };

    const { result } = renderHook(
      () => {
        const handleToggleColumnSort = useHandleToggleColumnSort({
          objectMetadataItemId: mockObjectMetadataItem.id,
        });

        const currentRecordSorts = useAtomComponentStateValue(
          currentRecordSortsComponentState,
          RECORD_INDEX_ID,
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
                instanceId: RECORD_INDEX_ID,
              }),
              [initialSort],
            );
          },
        }),
      },
    );

    act(() => {
      result.current.handleToggleColumnSort(firstField.id);
    });

    expect(result.current.currentRecordSorts).toEqual([
      {
        id: initialSort.id,
        fieldMetadataId: firstField.id,
        direction: ViewSortDirection.DESC,
      },
    ]);
  });

  it('should toggle direction back to ASC when the clicked column is already the sole sort with DESC', () => {
    const initialSort: RecordSort = {
      id: 'sort-1',
      fieldMetadataId: firstField.id,
      direction: ViewSortDirection.DESC,
    };

    const { result } = renderHook(
      () => {
        const handleToggleColumnSort = useHandleToggleColumnSort({
          objectMetadataItemId: mockObjectMetadataItem.id,
        });

        const currentRecordSorts = useAtomComponentStateValue(
          currentRecordSortsComponentState,
          RECORD_INDEX_ID,
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
                instanceId: RECORD_INDEX_ID,
              }),
              [initialSort],
            );
          },
        }),
      },
    );

    act(() => {
      result.current.handleToggleColumnSort(firstField.id);
    });

    expect(result.current.currentRecordSorts).toEqual([
      {
        id: initialSort.id,
        fieldMetadataId: firstField.id,
        direction: ViewSortDirection.ASC,
      },
    ]);
  });

  it('should replace existing sorts instead of appending when clicking a different column header', () => {
    const initialSort: RecordSort = {
      id: 'sort-1',
      fieldMetadataId: firstField.id,
      direction: ViewSortDirection.ASC,
    };

    const { result } = renderHook(
      () => {
        const handleToggleColumnSort = useHandleToggleColumnSort({
          objectMetadataItemId: mockObjectMetadataItem.id,
        });

        const currentRecordSorts = useAtomComponentStateValue(
          currentRecordSortsComponentState,
          RECORD_INDEX_ID,
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
                instanceId: RECORD_INDEX_ID,
              }),
              [initialSort],
            );
          },
        }),
      },
    );

    act(() => {
      result.current.handleToggleColumnSort(secondField.id);
    });

    // Must replace firstField with secondField ASC, NOT append to it!
    expect(result.current.currentRecordSorts).toHaveLength(1);
    expect(result.current.currentRecordSorts).toEqual([
      expect.objectContaining({
        fieldMetadataId: secondField.id,
        direction: ViewSortDirection.ASC,
      }),
    ]);
  });

  it('should replace multiple existing sorts when clicking a column header', () => {
    const initialSorts: RecordSort[] = [
      {
        id: 'sort-1',
        fieldMetadataId: firstField.id,
        direction: ViewSortDirection.ASC,
      },
      {
        id: 'sort-2',
        fieldMetadataId: secondField.id,
        direction: ViewSortDirection.DESC,
      },
    ];

    const { result } = renderHook(
      () => {
        const handleToggleColumnSort = useHandleToggleColumnSort({
          objectMetadataItemId: mockObjectMetadataItem.id,
        });

        const currentRecordSorts = useAtomComponentStateValue(
          currentRecordSortsComponentState,
          RECORD_INDEX_ID,
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
                instanceId: RECORD_INDEX_ID,
              }),
              initialSorts,
            );
          },
        }),
      },
    );

    act(() => {
      result.current.handleToggleColumnSort(secondField.id);
    });

    // Replaces the multi-sort with only secondField ASC
    expect(result.current.currentRecordSorts).toEqual([
      {
        id: 'sort-2',
        fieldMetadataId: secondField.id,
        direction: ViewSortDirection.ASC,
      },
    ]);
  });
});
