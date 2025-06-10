import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { FieldMetadataType } from '~/generated/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { useUpsertRecordFilter } from '../useUpsertRecordFilter';

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useUpsertRecordFilter', () => {
  it('should add a new filter when record filter id does not exist', () => {
    const { result } = renderHook(
      () => {
        const currentRecordFilters = useRecoilComponentValueV2(
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
      operand: ViewFilterOperand.Contains,
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
        const currentRecordFilters = useRecoilComponentValueV2(
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
      operand: ViewFilterOperand.Contains,
      displayValue: 'initial-value',
      label: 'Test Field',
      type: FieldMetadataType.TEXT,
    };

    const mockUpdatedRecordFilter: RecordFilter = {
      id: 'filter-1',
      fieldMetadataId: 'field-1',
      value: 'updated-value',
      operand: ViewFilterOperand.Contains,
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
