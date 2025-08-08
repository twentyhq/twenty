import { act, renderHook } from '@testing-library/react';

import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';

import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { ViewSort } from '@/views/types/ViewSort';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';

import { View } from '@/views/types/View';
import { isDefined } from 'twenty-shared/utils';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { mockedViewsData } from '~/testing/mock-data/views';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { useApplyCurrentViewSortsToCurrentRecordSorts } from '../useApplyCurrentViewSortsToCurrentRecordSorts';

const mockObjectMetadataItemNameSingular = 'company';

describe('useApplyCurrentViewSortsToCurrentRecordSorts', () => {
  const mockObjectMetadataItem = generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === mockObjectMetadataItemNameSingular,
  );

  if (!isDefined(mockObjectMetadataItem)) {
    throw new Error(
      'Missing mock object metadata item with name singular "company"',
    );
  }

  const mockFieldMetadataItem = mockObjectMetadataItem.fields.find(
    (field) => field.name === 'name',
  );

  if (!isDefined(mockFieldMetadataItem)) {
    throw new Error('Missing mock field metadata item with type TEXT');
  }

  const mockViewSort: ViewSort = {
    __typename: 'ViewSort',
    id: 'sort-1',
    fieldMetadataId: mockFieldMetadataItem.id,
    direction: 'asc',
  };

  const allCompaniesView = mockedViewsData[0];

  const mockView = {
    ...allCompaniesView,
    viewSorts: [mockViewSort],
  } satisfies View;

  it('should apply sorts from current view', () => {
    const { result } = renderHook(
      () => {
        const { applyCurrentViewSortsToCurrentRecordSorts } =
          useApplyCurrentViewSortsToCurrentRecordSorts();

        const currentSorts = useRecoilComponentValue(
          currentRecordSortsComponentState,
        );

        return {
          applyCurrentViewSortsToCurrentRecordSorts,
          currentSorts,
        };
      },
      {
        wrapper: getJestMetadataAndApolloMocksAndActionMenuWrapper({
          apolloMocks: [],
          componentInstanceId: 'instanceId',
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
          contextStoreCurrentViewId: mockView.id,
          onInitializeRecoilSnapshot: (snapshot) => {
            snapshot.set(prefetchViewsState, [mockView]);
          },
        }),
      },
    );

    act(() => {
      result.current.applyCurrentViewSortsToCurrentRecordSorts();
    });

    expect(result.current.currentSorts).toEqual([
      {
        id: mockViewSort.id,
        fieldMetadataId: mockViewSort.fieldMetadataId,
        direction: mockViewSort.direction,
      } satisfies RecordSort,
    ]);
  });

  it('should not apply sorts when current view is not found', () => {
    const { result } = renderHook(
      () => {
        const { applyCurrentViewSortsToCurrentRecordSorts } =
          useApplyCurrentViewSortsToCurrentRecordSorts();

        const currentSorts = useRecoilComponentValue(
          currentRecordSortsComponentState,
        );

        return {
          applyCurrentViewSortsToCurrentRecordSorts,
          currentSorts,
        };
      },
      {
        wrapper: getJestMetadataAndApolloMocksAndActionMenuWrapper({
          apolloMocks: [],
          componentInstanceId: 'instanceId',
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
          onInitializeRecoilSnapshot: (snapshot) => {
            snapshot.set(
              contextStoreCurrentViewIdComponentState.atomFamily({
                instanceId: 'instanceId',
              }),
              mockView.id,
            );

            snapshot.set(prefetchViewsState, []);
          },
        }),
      },
    );

    act(() => {
      result.current.applyCurrentViewSortsToCurrentRecordSorts();
    });

    expect(result.current.currentSorts).toEqual([]);
  });

  it('should handle view with empty sorts', () => {
    const viewWithNoSorts = {
      ...mockView,
      viewSorts: [],
    };

    const { result } = renderHook(
      () => {
        const { applyCurrentViewSortsToCurrentRecordSorts } =
          useApplyCurrentViewSortsToCurrentRecordSorts();

        const currentSorts = useRecoilComponentValue(
          currentRecordSortsComponentState,
        );

        return {
          applyCurrentViewSortsToCurrentRecordSorts,
          currentSorts,
        };
      },
      {
        wrapper: getJestMetadataAndApolloMocksAndActionMenuWrapper({
          apolloMocks: [],
          componentInstanceId: 'instanceId',
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
          onInitializeRecoilSnapshot: (snapshot) => {
            snapshot.set(
              contextStoreCurrentViewIdComponentState.atomFamily({
                instanceId: 'instanceId',
              }),
              mockView.id,
            );

            snapshot.set(prefetchViewsState, [viewWithNoSorts]);
          },
        }),
      },
    );

    act(() => {
      result.current.applyCurrentViewSortsToCurrentRecordSorts();
    });

    expect(result.current.currentSorts).toEqual([]);
  });
});
