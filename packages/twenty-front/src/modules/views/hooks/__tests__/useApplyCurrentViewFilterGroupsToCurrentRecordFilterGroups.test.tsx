import { renderHook } from '@testing-library/react';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups } from '@/views/hooks/useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups';
import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { type View } from '@/views/types/View';
import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator } from '@/views/utils/mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator';
import { act } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type CoreViewFilterGroup } from '~/generated/graphql';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import {
  mockedCoreViewsData,
  mockedViewsData,
} from '~/testing/mock-data/views';
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

  const allCompaniesView = mockedViewsData[0];
  const allCompaniesCoreView = mockedCoreViewsData[0];

  const mockCoreViewFilterGroup: Omit<CoreViewFilterGroup, 'workspaceId'> = {
    __typename: 'CoreViewFilterGroup',
    id: 'filter-group-1',
    viewId: allCompaniesCoreView.id,
    logicalOperator: ViewFilterGroupLogicalOperator.AND,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    positionInViewFilterGroup: 0,
  };

  const mockView = {
    ...allCompaniesView,
    viewFilterGroups: [mockViewFilterGroup],
  } satisfies View;

  const mockCoreView = {
    ...allCompaniesCoreView,
    viewFilterGroups: [mockCoreViewFilterGroup],
  } satisfies CoreViewWithRelations;

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
            snapshot.set(coreViewsState, [mockCoreView]);
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

            snapshot.set(coreViewsState, []);
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

            snapshot.set(coreViewsState, [
              { ...mockCoreView, viewFilterGroups: [] },
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
