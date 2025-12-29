import { act, renderHook } from '@testing-library/react';

import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

import { type CoreViewSortEssential } from '@/views/types/CoreViewSortEssential';
import { isDefined } from 'twenty-shared/utils';
import { ViewSortDirection } from '~/generated/graphql';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { useApplyViewSortsToCurrentRecordSorts } from '@/views/hooks/useApplyViewSortsToCurrentRecordSorts';

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

  const mockViewSort: CoreViewSortEssential = {
    id: 'sort-1',
    fieldMetadataId: mockFieldMetadataItem.id,
    direction: ViewSortDirection.ASC,
    viewId: 'view-1',
  };

  it('should apply view sorts to current record sorts', () => {
    const { result } = renderHook(
      () => {
        const { applyViewSortsToCurrentRecordSorts } =
          useApplyViewSortsToCurrentRecordSorts();

        const currentSorts = useRecoilComponentValue(
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
      },
    ]);
  });

  it('should handle empty view sorts array', () => {
    const { result } = renderHook(
      () => {
        const { applyViewSortsToCurrentRecordSorts } =
          useApplyViewSortsToCurrentRecordSorts();

        const currentSorts = useRecoilComponentValue(
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
