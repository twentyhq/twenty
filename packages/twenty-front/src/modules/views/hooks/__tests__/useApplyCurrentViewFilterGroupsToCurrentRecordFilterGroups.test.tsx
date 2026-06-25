import { renderHook } from '@testing-library/react';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { resetJotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups } from '@/views/hooks/useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { type View } from '@/views/types/View';
import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator } from '@/views/utils/mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator';
import { act } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type ViewFilterGroup as GqlViewFilterGroup } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const mockObjectMetadataItemNameSingular = 'company';

describe('useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups', () => {
  const mockObjectMetadataItem = getTestEnrichedObjectMetadataItemsMock().find(
    (item) => item.nameSingular === mockObjectMetadataItemNameSingular,
  );

  if (!isDefined(mockObjectMetadataItem)) {
    throw new Error(
      'Missing mock object metadata item with name singular "company"',
    );
  }

  beforeEach(() => {
    resetJotaiStore();
  });

  const mockViewFilterGroup: ViewFilterGroup = {
    id: 'filter-group-1',
    logicalOperator: ViewFilterGroupLogicalOperator.AND,
    viewId: 'view-1',
    parentViewFilterGroupId: null,
    positionInViewFilterGroup: 0,
  };

  const allCompaniesViewData = mockedViews.find(
    (v) => v.name === 'All Companies',
  )!;
  const allCompaniesView = allCompaniesViewData as unknown as View;

  const mockGqlViewFilterGroup: Omit<GqlViewFilterGroup, 'workspaceId'> = {
    __typename: 'ViewFilterGroup',
    id: 'filter-group-1',
    viewId: allCompaniesViewData.id,
    logicalOperator: ViewFilterGroupLogicalOperator.AND,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    positionInViewFilterGroup: 0,
  };

  const mockView = {
    ...allCompaniesView,
    viewFilterGroups: [mockViewFilterGroup],
  } satisfies View;

  const mockViewWithRelations = {
    ...allCompaniesViewData,
    viewFilterGroups: [mockGqlViewFilterGroup],
  } satisfies ViewWithRelations;

  it('should apply view filter groups from current view', () => {
    const { result } = renderHook(
      () => {
        const { applyCurrentViewFilterGroupsToCurrentRecordFilterGroups } =
          useApplyCurrentViewFilterGroupsToCurrentRecordFilterGroups();

        const currentRecordFilterGroups = useAtomComponentStateValue(
          currentRecordFilterGroupsComponentState,
          'recordIndexId',
        );

        return {
          applyCurrentViewFilterGroupsToCurrentRecordFilterGroups,
          currentRecordFilterGroups,
        };
      },
      {
        wrapper: getJestMetadataAndApolloMocksAndCommandMenuWrapper({
          apolloMocks: [],
          componentInstanceId: 'instanceId',
          contextStoreCurrentViewId: mockView.id,
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
          onInitializeJotaiStore: (store) => {
            setTestViewsInMetadataStore(store, [mockViewWithRelations]);
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
        parentRecordFilterGroupId:
          mockViewFilterGroup.parentViewFilterGroupId ?? undefined,
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

        const currentRecordFilterGroups = useAtomComponentStateValue(
          currentRecordFilterGroupsComponentState,
          'recordIndexId',
        );

        return {
          applyCurrentViewFilterGroupsToCurrentRecordFilterGroups,
          currentRecordFilterGroups,
        };
      },
      {
        wrapper: getJestMetadataAndApolloMocksAndCommandMenuWrapper({
          apolloMocks: [],
          componentInstanceId: 'instanceId',
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
          onInitializeJotaiStore: (store) => {
            store.set(
              contextStoreCurrentViewIdComponentState.atomFamily({
                instanceId: 'instanceId',
              }),
              mockView.id,
            );
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

        const currentRecordFilterGroups = useAtomComponentStateValue(
          currentRecordFilterGroupsComponentState,
          'recordIndexId',
        );

        return {
          applyCurrentViewFilterGroupsToCurrentRecordFilterGroups,
          currentRecordFilterGroups,
        };
      },
      {
        wrapper: getJestMetadataAndApolloMocksAndCommandMenuWrapper({
          apolloMocks: [],
          componentInstanceId: 'instanceId',
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
          onInitializeJotaiStore: (store) => {
            setTestViewsInMetadataStore(store, [
              { ...mockViewWithRelations, viewFilterGroups: [] },
            ]);
            store.set(
              contextStoreCurrentViewIdComponentState.atomFamily({
                instanceId: 'instanceId',
              }),
              mockView.id,
            );
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
