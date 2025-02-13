import { renderHook } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { useRemoveRecordFilter } from '../useRemoveRecordFilter';
import { useUpsertRecordFilter } from '../useUpsertRecordFilter';

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useRemoveRecordFilter', () => {
  it('should remove an existing filter', () => {
    const { result } = renderHook(
      () => {
        const currentRecordFilters = useRecoilComponentValueV2(
          currentRecordFiltersComponentState,
        );

        const { upsertRecordFilter } = useUpsertRecordFilter();
        const { removeRecordFilter } = useRemoveRecordFilter();

        return {
          upsertRecordFilter,
          removeRecordFilter,
          currentRecordFilters,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    const filter: RecordFilter = {
      id: 'filter-1',
      fieldMetadataId: 'field-1',
      value: 'test-value',
      operand: ViewFilterOperand.Contains,
      displayValue: 'test-value',
      definition: {
        type: 'TEXT',
        fieldMetadataId: 'field-1',
        label: 'Test Field',
        iconName: 'IconText',
      },
      label: 'Test Field',
      type: 'TEXT',
    };

    // First add a filter
    act(() => {
      result.current.upsertRecordFilter(filter);
    });

    expect(result.current.currentRecordFilters).toHaveLength(1);
    expect(result.current.currentRecordFilters[0]).toEqual(filter);

    // Then remove it
    act(() => {
      result.current.removeRecordFilter(filter.fieldMetadataId);
    });

    expect(result.current.currentRecordFilters).toHaveLength(0);
  });

  it('should not modify filters when trying to remove a non-existent filter', () => {
    const { result } = renderHook(
      () => {
        const currentRecordFilters = useRecoilComponentValueV2(
          currentRecordFiltersComponentState,
        );
        const { upsertRecordFilter } = useUpsertRecordFilter();
        const { removeRecordFilter } = useRemoveRecordFilter();
        return {
          upsertRecordFilter,
          removeRecordFilter,
          currentRecordFilters,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    const filter: RecordFilter = {
      id: 'filter-1',
      fieldMetadataId: 'field-1',
      value: 'test-value',
      operand: ViewFilterOperand.Contains,
      displayValue: 'test-value',
      definition: {
        type: 'TEXT',
        fieldMetadataId: 'field-1',
        label: 'Test Field',
        iconName: 'IconText',
      },
      label: 'Test Field',
      type: 'TEXT',
    };

    // Add a filter
    act(() => {
      result.current.upsertRecordFilter(filter);
    });

    expect(result.current.currentRecordFilters).toHaveLength(1);

    // Try to remove a non-existent filter
    act(() => {
      result.current.removeRecordFilter('non-existent-field');
    });

    // Filter list should remain unchanged
    expect(result.current.currentRecordFilters).toHaveLength(1);
    expect(result.current.currentRecordFilters[0]).toEqual(filter);
  });
});
