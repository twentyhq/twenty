import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { ViewFilterOperand } from 'twenty-shared/types';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useUpsertRecordFilter', () => {
  it('should add a new filter when record filter id does not exist', () => {
    const { result } = renderHook(
      () => {
        const currentRecordFilters = useRecoilComponentValue(
          currentRecordFiltersComponentState,
        );

        const { upsertRecordFilter } = useUpsertRecordFilter();

        return { upsertRecordFilter, currentRecordFilters };
      },
      {
        wrapper: Wrapper,
      },
    );

    const mockNewRecordFilter: RecordFilter = {
      id: 'filter-1',
      fieldMetadataId: 'field-1',
      value: 'test-value',
      operand: ViewFilterOperand.CONTAINS,
      displayValue: 'test-value',
      label: 'Test Field',
      type: FieldMetadataType.TEXT,
    };

    act(() => {
      result.current.upsertRecordFilter(mockNewRecordFilter);
    });

    expect(result.current.currentRecordFilters).toHaveLength(1);
    expect(result.current.currentRecordFilters[0]).toEqual(mockNewRecordFilter);
  });

  it('should update an existing filter when record filter id exists', () => {
    const { result } = renderHook(
      () => {
        const currentRecordFilters = useRecoilComponentValue(
          currentRecordFiltersComponentState,
        );

        const { upsertRecordFilter } = useUpsertRecordFilter();

        return { upsertRecordFilter, currentRecordFilters };
      },
      {
        wrapper: Wrapper,
      },
    );

    const mockInitialRecordFilter: RecordFilter = {
      id: 'filter-1',
      fieldMetadataId: 'field-1',
      value: 'initial-value',
      operand: ViewFilterOperand.CONTAINS,
      displayValue: 'initial-value',
      label: 'Test Field',
      type: FieldMetadataType.TEXT,
    };

    const mockUpdatedRecordFilter: RecordFilter = {
      id: 'filter-1',
      fieldMetadataId: 'field-1',
      value: 'updated-value',
      operand: ViewFilterOperand.CONTAINS,
      displayValue: 'updated-value',
      label: 'Test Field',
      type: FieldMetadataType.TEXT,
    };

    act(() => {
      result.current.upsertRecordFilter(mockInitialRecordFilter);
    });

    expect(result.current.currentRecordFilters).toHaveLength(1);
    expect(result.current.currentRecordFilters[0]).toEqual(
      mockInitialRecordFilter,
    );

    act(() => {
      result.current.upsertRecordFilter(mockUpdatedRecordFilter);
    });

    expect(result.current.currentRecordFilters).toHaveLength(1);
    expect(result.current.currentRecordFilters[0]).toEqual(
      mockUpdatedRecordFilter,
    );
  });
});
