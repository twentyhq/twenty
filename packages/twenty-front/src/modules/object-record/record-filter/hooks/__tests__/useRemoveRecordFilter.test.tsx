import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { ViewFilterOperand } from 'twenty-shared/types';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BaseWrapper>
    <RecordFiltersComponentInstanceContext.Provider
      value={{ instanceId: 'test' }}
    >
      {children}
    </RecordFiltersComponentInstanceContext.Provider>
  </BaseWrapper>
);

describe('useRemoveRecordFilter', () => {
  it('should remove an existing record filter', () => {
    const { result } = renderHook(
      () => {
        const currentRecordFilters = useRecoilComponentValueV2(
          currentRecordFiltersComponentState,
          'test',
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
        const currentRecordFilters = useRecoilComponentValueV2(
          currentRecordFiltersComponentState,
          'test',
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
