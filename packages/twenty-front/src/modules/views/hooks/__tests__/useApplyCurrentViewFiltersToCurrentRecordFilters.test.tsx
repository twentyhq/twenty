import { act, renderHook } from '@testing-library/react';

import {
  formatFieldMetadataItemAsFilterDefinition,
  getFilterTypeFromFieldType,
} from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterDefinition } from '@/object-record/record-filter/types/RecordFilterDefinition';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { isDefined } from 'twenty-shared';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { useApplyCurrentViewFiltersToCurrentRecordFilters } from '../useApplyCurrentViewFiltersToCurrentRecordFilters';

jest.mock('@/prefetch/hooks/usePrefetchedData');

describe('useApplyCurrentViewFiltersToCurrentRecordFilters', () => {
  const mockObjectMetadataItem = generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === 'company',
  );

  if (!isDefined(mockObjectMetadataItem)) {
    throw new Error(
      'Missing mock object metadata item with name singular "company"',
    );
  }

  const mockFieldMetadataItem = mockObjectMetadataItem.fields[0];

  const mockFilterDefinition: RecordFilterDefinition =
    formatFieldMetadataItemAsFilterDefinition({
      field: mockFieldMetadataItem,
    });

  const mockViewFilter: ViewFilter = {
    __typename: 'ViewFilter',
    id: 'filter-1',
    fieldMetadataId: mockFieldMetadataItem.id,
    operand: ViewFilterOperand.Contains,
    value: 'test',
    displayValue: mockFieldMetadataItem.label,
    viewFilterGroupId: 'group-1',
    positionInViewFilterGroup: 0,
    definition: mockFilterDefinition,
  };

  const mockView = {
    id: 'view-1',
    name: 'Test View',
    objectMetadataId: mockObjectMetadataItem.id,
    viewFilters: [mockViewFilter],
  };

  it('should apply filters from current view', () => {
    (usePrefetchedData as jest.Mock).mockReturnValue({
      records: [mockView],
    });

    const { result } = renderHook(
      () => {
        const { applyCurrentViewFiltersToCurrentRecordFilters } =
          useApplyCurrentViewFiltersToCurrentRecordFilters();

        const currentFilters = useRecoilComponentValueV2(
          currentRecordFiltersComponentState,
        );

        return {
          applyCurrentViewFiltersToCurrentRecordFilters,
          currentFilters,
        };
      },
      {
        wrapper: getJestMetadataAndApolloMocksWrapper({
          onInitializeRecoilSnapshot: (snapshot) => {
            snapshot.set(
              currentViewIdComponentState.atomFamily({
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

    expect(result.current.currentFilters).toEqual([
      {
        id: mockViewFilter.id,
        fieldMetadataId: mockViewFilter.fieldMetadataId,
        value: mockViewFilter.value,
        displayValue: mockViewFilter.displayValue,
        operand: mockViewFilter.operand,
        viewFilterGroupId: mockViewFilter.viewFilterGroupId,
        positionInViewFilterGroup: mockViewFilter.positionInViewFilterGroup,
        definition: mockFilterDefinition,
        label: mockViewFilter.displayValue,
        type: getFilterTypeFromFieldType(mockFieldMetadataItem.type),
      } satisfies RecordFilter,
    ]);
  });

  it('should not apply filters when current view is not found', () => {
    (usePrefetchedData as jest.Mock).mockReturnValue({
      records: [],
    });

    const { result } = renderHook(
      () => {
        const { applyCurrentViewFiltersToCurrentRecordFilters } =
          useApplyCurrentViewFiltersToCurrentRecordFilters();

        const currentFilters = useRecoilComponentValueV2(
          currentRecordFiltersComponentState,
        );

        return {
          applyCurrentViewFiltersToCurrentRecordFilters,
          currentFilters,
        };
      },
      {
        wrapper: getJestMetadataAndApolloMocksWrapper({
          onInitializeRecoilSnapshot: (snapshot) => {
            snapshot.set(
              currentViewIdComponentState.atomFamily({
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
    const viewWithNoFilters = {
      ...mockView,
      viewFilters: [],
    };

    (usePrefetchedData as jest.Mock).mockReturnValue({
      records: [viewWithNoFilters],
    });

    const { result } = renderHook(
      () => {
        const { applyCurrentViewFiltersToCurrentRecordFilters } =
          useApplyCurrentViewFiltersToCurrentRecordFilters();

        const currentFilters = useRecoilComponentValueV2(
          currentRecordFiltersComponentState,
        );

        return {
          applyCurrentViewFiltersToCurrentRecordFilters,
          currentFilters,
        };
      },
      {
        wrapper: getJestMetadataAndApolloMocksWrapper({
          onInitializeRecoilSnapshot: (snapshot) => {
            snapshot.set(
              currentViewIdComponentState.atomFamily({
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
