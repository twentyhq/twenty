import { act, renderHook } from '@testing-library/react';

import { useHandleToggleColumnSort } from '@/object-record/record-index/hooks/useHandleToggleColumnSort';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import { ViewSortDirection } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

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

  const nameField = mockObjectMetadataItem.fields.find(
    (field) => field.name === 'name',
  );
  const domainNameField = mockObjectMetadataItem.fields.find(
    (field) => field.name === 'domainName',
  );

  if (!isDefined(nameField) || !isDefined(domainNameField)) {
    throw new Error('Missing mock fields');
  }

  const COMPONENT_INSTANCE_ID = 'test-instance-id';

  const renderToggleSortHook = (initialSorts: RecordSort[] = []) =>
    renderHook(
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
          componentInstanceId: COMPONENT_INSTANCE_ID,
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
          onInitializeJotaiStore: (store) => {
            store.set(
              currentRecordSortsComponentState.atomFamily({
                instanceId: COMPONENT_INSTANCE_ID,
              }),
              initialSorts,
            );
          },
        }),
      },
    );

  it('sets a single ASC sort when no sorts exist', () => {
    const { result } = renderToggleSortHook([]);

    act(() => {
      result.current.handleToggleColumnSort(nameField.id);
    });

    expect(result.current.currentRecordSorts).toEqual([
      {
        id: expect.any(String),
        fieldMetadataId: nameField.id,
        direction: ViewSortDirection.ASC,
      },
    ]);
  });

  it('flips direction to DESC when the column is already sorted ASC', () => {
    const initialSort: RecordSort = {
      id: 'existing-sort-id',
      fieldMetadataId: nameField.id,
      direction: ViewSortDirection.ASC,
    };

    const { result } = renderToggleSortHook([initialSort]);

    act(() => {
      result.current.handleToggleColumnSort(nameField.id);
    });

    expect(result.current.currentRecordSorts).toEqual([
      {
        id: 'existing-sort-id',
        fieldMetadataId: nameField.id,
        direction: ViewSortDirection.DESC,
      },
    ]);
  });

  it('replaces existing sorts when sorting from a column header instead of appending', () => {
    const existingSort: RecordSort = {
      id: 'saved-tier-sort',
      fieldMetadataId: nameField.id,
      direction: ViewSortDirection.ASC,
    };

    const { result } = renderToggleSortHook([existingSort]);

    act(() => {
      result.current.handleToggleColumnSort(domainNameField.id);
    });

    expect(result.current.currentRecordSorts).toEqual([
      {
        id: expect.any(String),
        fieldMetadataId: domainNameField.id,
        direction: ViewSortDirection.ASC,
      },
    ]);
  });
});
