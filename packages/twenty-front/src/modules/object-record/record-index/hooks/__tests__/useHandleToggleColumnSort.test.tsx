import { act, renderHook } from '@testing-library/react';

import { useHandleToggleColumnSort } from '@/object-record/record-index/hooks/useHandleToggleColumnSort';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
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

  const getFieldMetadataItemId = (fieldName: string) => {
    const fieldMetadataItem = mockObjectMetadataItem.fields.find(
      (field) => field.name === fieldName,
    );

    if (!isDefined(fieldMetadataItem)) {
      throw new Error(`Missing mock field metadata ${fieldName}`);
    }

    return fieldMetadataItem.id;
  };

  const nameFieldMetadataItemId = getFieldMetadataItemId('name');
  const employeesFieldMetadataItemId = getFieldMetadataItemId('employees');

  const savedSort: RecordSort = {
    id: 'saved-sort',
    fieldMetadataId: nameFieldMetadataItemId,
    direction: ViewSortDirection.ASC,
  };

  const renderUseHandleToggleColumnSort = () =>
    renderHook(
      () => {
        const handleToggleColumnSort = useHandleToggleColumnSort({
          objectMetadataItemId: mockObjectMetadataItem.id,
        });

        const [currentRecordSorts, setCurrentRecordSorts] =
          useAtomComponentState(currentRecordSortsComponentState);

        return {
          handleToggleColumnSort,
          currentRecordSorts,
          setCurrentRecordSorts,
        };
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

  it('should sort by the column when there is no sort', () => {
    const { result } = renderUseHandleToggleColumnSort();

    act(() => {
      result.current.handleToggleColumnSort(employeesFieldMetadataItemId);
    });

    expect(result.current.currentRecordSorts).toEqual([
      {
        id: expect.any(String),
        fieldMetadataId: employeesFieldMetadataItemId,
        direction: ViewSortDirection.ASC,
      },
    ]);
  });

  it('should replace the existing sorts with the column sort', () => {
    const { result } = renderUseHandleToggleColumnSort();

    act(() => {
      result.current.setCurrentRecordSorts([savedSort]);
    });

    act(() => {
      result.current.handleToggleColumnSort(employeesFieldMetadataItemId);
    });

    expect(result.current.currentRecordSorts).toEqual([
      {
        id: expect.any(String),
        fieldMetadataId: employeesFieldMetadataItemId,
        direction: ViewSortDirection.ASC,
      },
    ]);
  });

  it('should flip the direction when the column is already sorted', () => {
    const { result } = renderUseHandleToggleColumnSort();

    act(() => {
      result.current.setCurrentRecordSorts([
        savedSort,
        {
          id: 'employees-sort',
          fieldMetadataId: employeesFieldMetadataItemId,
          direction: ViewSortDirection.ASC,
        },
      ]);
    });

    act(() => {
      result.current.handleToggleColumnSort(employeesFieldMetadataItemId);
    });

    expect(result.current.currentRecordSorts).toEqual([
      {
        id: 'employees-sort',
        fieldMetadataId: employeesFieldMetadataItemId,
        direction: ViewSortDirection.DESC,
      },
    ]);
  });
});
