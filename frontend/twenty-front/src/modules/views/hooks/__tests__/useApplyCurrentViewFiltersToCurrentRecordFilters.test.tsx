import { renderHook } from '@testing-library/react';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { resetJotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useApplyCurrentViewFiltersToCurrentRecordFilters } from '@/views/hooks/useApplyCurrentViewFiltersToCurrentRecordFilters';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { type View } from '@/views/types/View';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { act } from 'react';
import { ViewFilterOperand } from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
import {
  type ViewFilter as GqlViewFilter,
  ViewFilterOperand as GqlViewFilterOperand,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const mockObjectMetadataItemNameSingular = 'company';

describe('useApplyCurrentViewFiltersToCurrentRecordFilters', () => {
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

  const allCompaniesViewData = mockedViews.find(
    (v) => v.name === 'All Companies',
  )!;
  const allCompaniesView = allCompaniesViewData as unknown as View;

  const mockFieldMetadataItem = mockObjectMetadataItem.fields[0];

  const mockViewFilter: ViewFilter = {
    id: 'filter-1',
    fieldMetadataId: mockFieldMetadataItem.id,
    operand: ViewFilterOperand.CONTAINS,
    value: 'test',
    displayValue: 'test',
    viewFilterGroupId: 'group-1',
    positionInViewFilterGroup: 0,
    subFieldName: null,
  };

  const mockGqlViewFilter: Omit<GqlViewFilter, 'workspaceId'> = {
    id: 'filter-1',
    fieldMetadataId: mockFieldMetadataItem.id,
    operand: GqlViewFilterOperand.CONTAINS,
    value: 'test',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewId: allCompaniesViewData.id,
    positionInViewFilterGroup: 0,
    viewFilterGroupId: 'group-1',
    subFieldName: null,
  };

  const mockView = {
    ...allCompaniesView,
    viewFilters: [mockViewFilter],
  } satisfies View;

  const mockViewWithRelations = {
    ...allCompaniesViewData,
    viewFilters: [mockGqlViewFilter],
  } satisfies ViewWithRelations;

  it('should apply filters from current view', () => {
    const { result } = renderHook(
      () => {
        const { applyCurrentViewFiltersToCurrentRecordFilters } =
          useApplyCurrentViewFiltersToCurrentRecordFilters();

        const currentRecordFilters = useAtomComponentStateValue(
          currentRecordFiltersComponentState,
          'recordIndexId',
        );

        return {
          applyCurrentViewFiltersToCurrentRecordFilters,
          currentRecordFilters,
        };
      },
      {
        wrapper: getJestMetadataAndApolloMocksAndCommandMenuWrapper({
          apolloMocks: [],
          componentInstanceId: 'instanceId',
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
          contextStoreCurrentViewId: mockView.id,
          onInitializeJotaiStore: (store) => {
            setTestViewsInMetadataStore(store, [mockViewWithRelations]);
          },
        }),
      },
    );

    act(() => {
      result.current.applyCurrentViewFiltersToCurrentRecordFilters();
    });

    expect(result.current.currentRecordFilters).toEqual([
      {
        id: mockViewFilter.id,
        fieldMetadataId: mockViewFilter.fieldMetadataId,
        value: mockViewFilter.value,
        displayValue: mockViewFilter.displayValue ?? mockViewFilter.value,
        operand: mockViewFilter.operand,
        recordFilterGroupId: mockViewFilter.viewFilterGroupId ?? undefined,
        positionInRecordFilterGroup: mockViewFilter.positionInViewFilterGroup,
        label: mockFieldMetadataItem.label,
        type: getFilterTypeFromFieldType(mockFieldMetadataItem.type),
        subFieldName: null,
      } satisfies RecordFilter,
    ]);
  });

  it('should not apply filters when current view is not found', () => {
    const { result } = renderHook(
      () => {
        const { applyCurrentViewFiltersToCurrentRecordFilters } =
          useApplyCurrentViewFiltersToCurrentRecordFilters();

        const currentRecordFilters = useAtomComponentStateValue(
          currentRecordFiltersComponentState,
          'recordIndexId',
        );

        return {
          applyCurrentViewFiltersToCurrentRecordFilters,
          currentRecordFilters,
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
      result.current.applyCurrentViewFiltersToCurrentRecordFilters();
    });

    expect(result.current.currentRecordFilters).toEqual([]);
  });

  it('should handle view with empty filters', () => {
    const { result } = renderHook(
      () => {
        const { applyCurrentViewFiltersToCurrentRecordFilters } =
          useApplyCurrentViewFiltersToCurrentRecordFilters();

        const currentRecordFilters = useAtomComponentStateValue(
          currentRecordFiltersComponentState,
          'recordIndexId',
        );

        return {
          applyCurrentViewFiltersToCurrentRecordFilters,
          currentRecordFilters,
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
              { ...mockViewWithRelations, viewFilters: [] },
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
      result.current.applyCurrentViewFiltersToCurrentRecordFilters();
    });

    expect(result.current.currentRecordFilters).toEqual([]);
  });
});
