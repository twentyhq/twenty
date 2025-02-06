import { act, renderHook } from '@testing-library/react';

import {
  formatFieldMetadataItemAsFilterDefinition,
  getFilterTypeFromFieldType,
} from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterDefinition } from '@/object-record/record-filter/types/RecordFilterDefinition';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { isDefined } from 'twenty-shared';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { useApplyViewFiltersToCurrentRecordFilters } from '../useApplyViewFiltersToCurrentRecordFilters';

describe('useApplyViewFiltersToCurrentRecordFilters', () => {
  const mockObjectMetadataItem = generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === 'company',
  );

  if (!isDefined(mockObjectMetadataItem)) {
    throw new Error(
      'Missing mock object metadata item with name singular "company"',
    );
  }

  const mockFieldMetadataItem = mockObjectMetadataItem.fields[0];

  const mockAvailableFilterDefinition: RecordFilterDefinition =
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
    definition: mockAvailableFilterDefinition,
  };

  it('should apply view filters to current record filters', () => {
    const { result } = renderHook(
      () => {
        const { applyViewFiltersToCurrentRecordFilters } =
          useApplyViewFiltersToCurrentRecordFilters();

        const currentFilters = useRecoilComponentValueV2(
          currentRecordFiltersComponentState,
        );

        return { applyViewFiltersToCurrentRecordFilters, currentFilters };
      },
      {
        wrapper: getJestMetadataAndApolloMocksWrapper({}),
      },
    );

    act(() => {
      result.current.applyViewFiltersToCurrentRecordFilters([mockViewFilter]);
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
        definition: mockAvailableFilterDefinition,
        label: mockViewFilter.displayValue,
        type: getFilterTypeFromFieldType(mockFieldMetadataItem.type),
      } satisfies RecordFilter,
    ]);
  });

  it('should handle empty view filters array', () => {
    const { result } = renderHook(
      () => {
        const { applyViewFiltersToCurrentRecordFilters } =
          useApplyViewFiltersToCurrentRecordFilters();

        const currentFilters = useRecoilComponentValueV2(
          currentRecordFiltersComponentState,
        );

        return { applyViewFiltersToCurrentRecordFilters, currentFilters };
      },
      {
        wrapper: getJestMetadataAndApolloMocksWrapper({}),
      },
    );

    act(() => {
      result.current.applyViewFiltersToCurrentRecordFilters([]);
    });

    expect(result.current.currentFilters).toEqual([]);
  });
});
