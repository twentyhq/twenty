import { act, renderHook } from '@testing-library/react';

import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewSort } from '@/views/types/ViewSort';

import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { useApplyViewSortsToCurrentRecordSorts } from '../useApplyViewSortsToCurrentRecordSorts';
import { isDefined } from 'twenty-shared/utils';

const mockObjectMetadataItemNameSingular = 'company';

describe('useApplyViewSortsToCurrentRecordSorts', () => {
  const mockObjectMetadataItem = generatedMockObjectMetadataItems.find(
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

  if (!isDefined(mockFieldMetadataItem)) {
    throw new Error(`Missing mock field metadata Name`);
  }

  const mockViewSort: ViewSort = {
    __typename: 'ViewSort',
    id: 'sort-1',
    fieldMetadataId: mockFieldMetadataItem.id,
    direction: 'asc',
  };

  it('should apply view sorts to current record sorts', () => {
    const { result } = renderHook(
      () => {
        const { applyViewSortsToCurrentRecordSorts } =
          useApplyViewSortsToCurrentRecordSorts();

        const currentSorts = useRecoilComponentValueV2(
          currentRecordSortsComponentState,
        );

        return { applyViewSortsToCurrentRecordSorts, currentSorts };
      },
      {
        wrapper: getJestMetadataAndApolloMocksAndActionMenuWrapper({
          apolloMocks: [],
          componentInstanceId: 'instanceId',
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
        }),
      },
    );

    act(() => {
      result.current.applyViewSortsToCurrentRecordSorts([mockViewSort]);
    });

    expect(result.current.currentSorts).toEqual([
      {
        id: mockViewSort.id,
        fieldMetadataId: mockViewSort.fieldMetadataId,
        direction: mockViewSort.direction,
      } satisfies RecordSort,
    ]);
  });

  it('should handle empty view sorts array', () => {
    const { result } = renderHook(
      () => {
        const { applyViewSortsToCurrentRecordSorts } =
          useApplyViewSortsToCurrentRecordSorts();

        const currentSorts = useRecoilComponentValueV2(
          currentRecordSortsComponentState,
        );

        return { applyViewSortsToCurrentRecordSorts, currentSorts };
      },
      {
        wrapper: getJestMetadataAndApolloMocksAndActionMenuWrapper({
          apolloMocks: [],
          componentInstanceId: 'instanceId',
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
        }),
      },
    );

    act(() => {
      result.current.applyViewSortsToCurrentRecordSorts([]);
    });

    expect(result.current.currentSorts).toEqual([]);
  });
});
