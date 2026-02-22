import { renderHook } from '@testing-library/react';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { type View } from '@/views/types/View';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { act } from 'react';
import { ViewFilterOperand } from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
import {
  type CoreViewFilter,
  ViewFilterOperand as CoreViewFilterOperand,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import {
  mockedCoreViewsData,
  mockedViewsData,
} from '~/testing/mock-data/views';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { useApplyCurrentViewFiltersToCurrentRecordFilters } from '@/views/hooks/useApplyCurrentViewFiltersToCurrentRecordFilters';

const mockObjectMetadataItemNameSingular = 'company';

describe('useApplyCurrentViewFiltersToCurrentRecordFilters', () => {
  const mockObjectMetadataItem = generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === mockObjectMetadataItemNameSingular,
  );

  if (!isDefined(mockObjectMetadataItem)) {
    throw new Error(
      'Missing mock object metadata item with name singular "company"',
    );
  }

  afterEach(() => {
    jotaiStore.set(coreViewsState.atom, []);
  });

  const allCompaniesView = mockedViewsData[0];
  const allCompaniesCoreView = mockedCoreViewsData[0];

  const mockFieldMetadataItem = mockObjectMetadataItem.fields[0];

  const mockViewFilter: ViewFilter = {
    __typename: 'ViewFilter',
    id: 'filter-1',
    fieldMetadataId: mockFieldMetadataItem.id,
    operand: ViewFilterOperand.CONTAINS,
    value: 'test',
    displayValue: 'test',
    viewFilterGroupId: 'group-1',
    positionInViewFilterGroup: 0,
    subFieldName: null,
  };

  const mockCoreViewFilter: Omit<CoreViewFilter, 'workspaceId'> = {
    __typename: 'CoreViewFilter',
    id: 'filter-1',
    fieldMetadataId: mockFieldMetadataItem.id,
    operand: CoreViewFilterOperand.CONTAINS,
    value: 'test',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewId: allCompaniesCoreView.id,
    positionInViewFilterGroup: 0,
    viewFilterGroupId: 'group-1',
    subFieldName: null,
  };

  const mockView = {
    ...allCompaniesView,
    viewFilters: [mockViewFilter],
  } satisfies View;

  const mockCoreView = {
    ...allCompaniesCoreView,
    viewFilters: [mockCoreViewFilter],
  } satisfies CoreViewWithRelations;

  it('should apply filters from current view', () => {
    jotaiStore.set(coreViewsState.atom, [mockCoreView]);

    const { result } = renderHook(
      () => {
        const { applyCurrentViewFiltersToCurrentRecordFilters } =
          useApplyCurrentViewFiltersToCurrentRecordFilters();

        const currentFilters = useRecoilComponentValue(
          currentRecordFiltersComponentState,
        );

        return {
          applyCurrentViewFiltersToCurrentRecordFilters,
          currentFilters,
        };
      },
      {
        wrapper: getJestMetadataAndApolloMocksAndActionMenuWrapper({
          apolloMocks: [],
          componentInstanceId: 'instanceId',
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
          contextStoreCurrentViewId: mockView.id,
        }),
      },
    );

    act(() => {
      result.current.applyCurrentViewFiltersToCurrentRecordFilters();
    });

    expect(result.current.currentFilters).toEqual([
      {
        id: mockViewFilter.id,
        fieldMetadataId: mockViewFilter.fieldMetadataId,
        value: mockViewFilter.value,
        displayValue: mockViewFilter.displayValue,
        operand: mockViewFilter.operand,
        recordFilterGroupId: mockViewFilter.viewFilterGroupId,
        positionInRecordFilterGroup: mockViewFilter.positionInViewFilterGroup,
        label: mockFieldMetadataItem.label,
        type: getFilterTypeFromFieldType(mockFieldMetadataItem.type),
        subFieldName: null,
      } satisfies RecordFilter,
    ]);
  });

  it('should not apply filters when current view is not found', () => {
    jotaiStore.set(coreViewsState.atom, []);

    const { result } = renderHook(
      () => {
        const { applyCurrentViewFiltersToCurrentRecordFilters } =
          useApplyCurrentViewFiltersToCurrentRecordFilters();

        const currentFilters = useRecoilComponentValue(
          currentRecordFiltersComponentState,
        );

        return {
          applyCurrentViewFiltersToCurrentRecordFilters,
          currentFilters,
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
          },
        }),
      },
    );

    act(() => {
      result.current.applyCurrentViewFiltersToCurrentRecordFilters();
    });

    expect(result.current.currentFilters).toEqual([]);
  });

  it('should handle view with empty filters', () => {
    jotaiStore.set(coreViewsState.atom, [{ ...mockCoreView, viewFilters: [] }]);

    const { result } = renderHook(
      () => {
        const { applyCurrentViewFiltersToCurrentRecordFilters } =
          useApplyCurrentViewFiltersToCurrentRecordFilters();

        const currentFilters = useRecoilComponentValue(
          currentRecordFiltersComponentState,
        );

        return {
          applyCurrentViewFiltersToCurrentRecordFilters,
          currentFilters,
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
          },
        }),
      },
    );

    act(() => {
      result.current.applyCurrentViewFiltersToCurrentRecordFilters();
    });

    expect(result.current.currentFilters).toEqual([]);
  });
});
