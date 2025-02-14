import { renderHook } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { useUpsertRecordFilter } from '../useUpsertRecordFilter';

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useUpsertRecordFilter', () => {
  it('should add a new filter when fieldMetadataId does not exist', () => {
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

    const newFilter: RecordFilter = {
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

    act(() => {
      result.current.upsertRecordFilter(newFilter);
    });

    expect(result.current.currentRecordFilters).toHaveLength(1);
    expect(result.current.currentRecordFilters[0]).toEqual(newFilter);
  });

  it('should update an existing filter when fieldMetadataId exists', () => {
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

    const initialFilter: RecordFilter = {
      id: 'filter-1',
      fieldMetadataId: 'field-1',
      value: 'initial-value',
      operand: ViewFilterOperand.Contains,
      displayValue: 'initial-value',
      definition: {
        type: 'TEXT',
        fieldMetadataId: 'field-1',
        label: 'Test Field',
        iconName: 'IconText',
      },
      label: 'Test Field',
      type: 'TEXT',
    };

    const updatedFilter: RecordFilter = {
      id: 'filter-1',
      fieldMetadataId: 'field-1',
      value: 'updated-value',
      operand: ViewFilterOperand.Contains,
      displayValue: 'updated-value',
      definition: {
        type: 'TEXT',
        fieldMetadataId: 'field-1',
        label: 'Test Field',
        iconName: 'IconText',
      },
      label: 'Test Field',
      type: 'TEXT',
    };

    act(() => {
      result.current.upsertRecordFilter(initialFilter);
    });

    expect(result.current.currentRecordFilters).toHaveLength(1);
    expect(result.current.currentRecordFilters[0]).toEqual(initialFilter);

    act(() => {
      result.current.upsertRecordFilter(updatedFilter);
    });

    expect(result.current.currentRecordFilters).toHaveLength(1);
    expect(result.current.currentRecordFilters[0]).toEqual(updatedFilter);
  });
});
