import { renderHook } from '@testing-library/react';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups } from '@/views/hooks/useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups';
import { View } from '@/views/types/View';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { ViewType } from '@/views/types/ViewType';
import { mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator } from '@/views/utils/mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator';
import { act } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const mockObjectMetadataItemNameSingular = 'company';

describe('useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups', () => {
  const mockObjectMetadataItem = generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === mockObjectMetadataItemNameSingular,
  );

  if (!isDefined(mockObjectMetadataItem)) {
    throw new Error(
      'Missing mock object metadata item with name singular "company"',
    );
  }

  const mockViewFilterGroup: ViewFilterGroup = {
    __typename: 'ViewFilterGroup',
    id: 'filter-group-1',
    logicalOperator: ViewFilterGroupLogicalOperator.AND,
    viewId: 'view-1',
    parentViewFilterGroupId: null,
    positionInViewFilterGroup: 0,
  };

  const mockView: View = {
    id: 'view-1',
    name: 'Test View',
    objectMetadataId: mockObjectMetadataItem.id,
    viewFilters: [],
    viewFilterGroups: [mockViewFilterGroup],
    type: ViewType.Table,
    key: null,
    isCompact: false,
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    viewFields: [],
    viewGroups: [],
    viewSorts: [],
    kanbanFieldMetadataId: '',
    kanbanAggregateOperation: AggregateOperations.COUNT,
    icon: '',
    kanbanAggregateOperationFieldMetadataId: '',
    position: 0,
    __typename: 'View',
  };

  it('should apply view filter groups from current view', () => {
    const { result } = renderHook(
      () => {
        const { applyCurrentViewFilterGroupsToCurrentRecordFilterGroups } =
          useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups();

        const currentRecordFilterGroups = useRecoilComponentValue(
          currentRecordFilterGroupsComponentState,
        );

        return {
          applyCurrentViewFilterGroupsToCurrentRecordFilterGroups,
          currentRecordFilterGroups,
        };
      },
      {
        wrapper: getJestMetadataAndApolloMocksAndActionMenuWrapper({
          apolloMocks: [],
          componentInstanceId: 'instanceId',
          contextStoreCurrentViewId: mockView.id,
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
          onInitializeRecoilSnapshot: (snapshot) => {
            snapshot.set(prefetchViewsState, [mockView]);
          },
        }),
      },
    );

    act(() => {
      result.current.applyCurrentViewFilterGroupsToCurrentRecordFilterGroups();
    });

    const expectedRecordFilterGroups: RecordFilterGroup[] = [
      {
        id: mockViewFilterGroup.id,
        logicalOperator:
          mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator({
            viewFilterGroupLogicalOperator: mockViewFilterGroup.logicalOperator,
          }),
        parentRecordFilterGroupId: mockViewFilterGroup.parentViewFilterGroupId,
        positionInRecordFilterGroup:
          mockViewFilterGroup.positionInViewFilterGroup,
      },
    ];

    expect(result.current.currentRecordFilterGroups).toEqual(
      expectedRecordFilterGroups,
    );
  });

  it('should not apply view filter groups when current view is not found', () => {
    const { result } = renderHook(
      () => {
        const { applyCurrentViewFilterGroupsToCurrentRecordFilterGroups } =
          useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups();

        const currentRecordFilterGroups = useRecoilComponentValue(
          currentRecordFilterGroupsComponentState,
        );

        return {
          applyCurrentViewFilterGroupsToCurrentRecordFilterGroups,
          currentRecordFilterGroups,
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
      result.current.applyCurrentViewFilterGroupsToCurrentRecordFilterGroups();
    });

    expect(result.current.currentRecordFilterGroups).toEqual([]);
  });

  it('should handle view with empty view filter groups', () => {
    const { result } = renderHook(
      () => {
        const { applyCurrentViewFilterGroupsToCurrentRecordFilterGroups } =
          useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups();

        const currentRecordFilterGroups = useRecoilComponentValue(
          currentRecordFilterGroupsComponentState,
        );

        return {
          applyCurrentViewFilterGroupsToCurrentRecordFilterGroups,
          currentRecordFilterGroups,
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

            snapshot.set(prefetchViewsState, [
              { ...mockView, viewFilterGroups: [] },
            ]);
          },
        }),
      },
    );

    act(() => {
      result.current.applyCurrentViewFilterGroupsToCurrentRecordFilterGroups();
    });

    expect(result.current.currentRecordFilterGroups).toEqual([]);
  });
});
