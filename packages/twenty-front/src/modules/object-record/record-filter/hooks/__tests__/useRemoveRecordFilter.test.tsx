import { renderHook } from '@testing-library/react';

import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { act } from 'react';
import { FieldMetadataType } from '~/generated/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { useRemoveRecordFilter } from '../useRemoveRecordFilter';
import { useUpsertRecordFilter } from '../useUpsertRecordFilter';

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useRemoveRecordFilter', () => {
  it('should remove an existing record filter', () => {
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

    const mockRecordFilter: RecordFilter = {
      id: 'filter-1',
      fieldMetadataId: 'field-1',
      value: 'test-value',
      operand: ViewFilterOperand.Contains,
      displayValue: 'test-value',
      label: 'Test Field',
      type: FieldMetadataType.TEXT,
    };

    act(() => {
      result.current.upsertRecordFilter(mockRecordFilter);
    });

    expect(result.current.currentRecordFilters).toHaveLength(1);
    expect(result.current.currentRecordFilters[0]).toEqual(mockRecordFilter);

    act(() => {
      result.current.removeRecordFilter({
        recordFilterId: mockRecordFilter.id,
      });
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

    const mockRecordFilter: RecordFilter = {
      id: 'filter-1',
      fieldMetadataId: 'field-1',
      value: 'test-value',
      operand: ViewFilterOperand.Contains,
      displayValue: 'test-value',
      label: 'Test Field',
      type: FieldMetadataType.TEXT,
    };

    act(() => {
      result.current.upsertRecordFilter(mockRecordFilter);
    });

    expect(result.current.currentRecordFilters).toHaveLength(1);

    act(() => {
      result.current.removeRecordFilter({
        recordFilterId: 'non-existent-field-metadata-id',
      });
    });

    expect(result.current.currentRecordFilters).toHaveLength(1);
    expect(result.current.currentRecordFilters[0]).toEqual(mockRecordFilter);
  });
});
