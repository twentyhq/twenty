import { renderHook } from '@testing-library/react';

import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { act } from 'react';
import { ViewFilterOperand } from 'twenty-shared/types';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useRemoveRecordFilter', () => {
  it('should remove an existing record filter', () => {
    const { result } = renderHook(
      () => {
        const currentRecordFilters = useRecoilComponentValue(
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
      operand: ViewFilterOperand.CONTAINS,
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
        const currentRecordFilters = useRecoilComponentValue(
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
      operand: ViewFilterOperand.CONTAINS,
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
