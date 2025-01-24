import { act, renderHook } from '@testing-library/react';

import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RecordFilterDefinition } from '@/object-record/record-filter/types/RecordFilterDefinition';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { useApplyCurrentViewFiltersToCurrentRecordFilters } from '../useApplyCurrentViewFiltersToCurrentRecordFilters';

jest.mock('@/prefetch/hooks/usePrefetchedData');

describe('useApplyCurrentViewFiltersToCurrentRecordFilters', () => {
  const mockFilterDefinition: RecordFilterDefinition = {
    fieldMetadataId: 'field-1',
    label: 'Test Field',
    type: 'TEXT',
    iconName: 'IconText',
  };

  const mockViewFilter: ViewFilter = {
    __typename: 'ViewFilter',
    id: 'filter-1',
    fieldMetadataId: 'field-1',
    operand: ViewFilterOperand.Contains,
    value: 'test',
    displayValue: 'test',
    viewFilterGroupId: 'group-1',
    positionInViewFilterGroup: 0,
    definition: mockFilterDefinition,
  };

  const mockView = {
    id: 'view-1',
    name: 'Test View',
    objectMetadataId: 'object-1',
    viewFilters: [mockViewFilter],
  };

  beforeEach(() => {
    (usePrefetchedData as jest.Mock).mockReturnValue({
      records: [mockView],
    });
  });

  it('should apply filters from current view', () => {
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
            snapshot.set(
              availableFilterDefinitionsComponentState.atomFamily({
                instanceId: 'instanceId',
              }),
              [mockFilterDefinition],
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
      },
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
            snapshot.set(
              availableFilterDefinitionsComponentState.atomFamily({
                instanceId: 'instanceId',
              }),
              [mockFilterDefinition],
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
            snapshot.set(
              availableFilterDefinitionsComponentState.atomFamily({
                instanceId: 'instanceId',
              }),
              [mockFilterDefinition],
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
