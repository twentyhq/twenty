import { act, renderHook } from '@testing-library/react';

import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from 'twenty-shared/src/types/ViewFilterOperand';
import { isDefined } from 'twenty-shared/utils';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { useApplyViewFiltersToCurrentRecordFilters } from '../useApplyViewFiltersToCurrentRecordFilters';

const mockObjectMetadataItemNameSingular = 'company';

describe('useApplyViewFiltersToCurrentRecordFilters', () => {
  const mockObjectMetadataItem = generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === mockObjectMetadataItemNameSingular,
  );

  if (!isDefined(mockObjectMetadataItem)) {
    throw new Error(
      `Missing mock object metadata item with name singular ${mockObjectMetadataItemNameSingular}`,
    );
  }

  const mockFieldMetadataItem = mockObjectMetadataItem.fields[0];

  const mockViewFilter: ViewFilter = {
    __typename: 'ViewFilter',
    id: 'filter-1',
    fieldMetadataId: mockFieldMetadataItem.id,
    operand: ViewFilterOperand.Contains,
    value: 'test',
    displayValue: mockFieldMetadataItem.label,
    viewFilterGroupId: 'group-1',
    positionInViewFilterGroup: 0,
  };

  it('should apply view filters to current record filters', () => {
    const { result } = renderHook(
      () => {
        const { applyViewFiltersToCurrentRecordFilters } =
          useApplyViewFiltersToCurrentRecordFilters();

        const currentFilters = useRecoilComponentValue(
          currentRecordFiltersComponentState,
        );

        return { applyViewFiltersToCurrentRecordFilters, currentFilters };
      },
      {
        wrapper: getJestMetadataAndApolloMocksAndActionMenuWrapper({
          apolloMocks: [],
          componentInstanceId: 'instanceId',
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
        }),
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
        recordFilterGroupId: mockViewFilter.viewFilterGroupId,
        positionInRecordFilterGroup: mockViewFilter.positionInViewFilterGroup,
        label: mockFieldMetadataItem.label,
        type: getFilterTypeFromFieldType(mockFieldMetadataItem.type),
      } satisfies RecordFilter,
    ]);
  });

  it('should handle empty view filters array', () => {
    const { result } = renderHook(
      () => {
        const { applyViewFiltersToCurrentRecordFilters } =
          useApplyViewFiltersToCurrentRecordFilters();

        const currentFilters = useRecoilComponentValue(
          currentRecordFiltersComponentState,
        );

        return { applyViewFiltersToCurrentRecordFilters, currentFilters };
      },
      {
        wrapper: getJestMetadataAndApolloMocksAndActionMenuWrapper({
          apolloMocks: [],
          componentInstanceId: 'instanceId',
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
        }),
      },
    );

    act(() => {
      result.current.applyViewFiltersToCurrentRecordFilters([]);
    });

    expect(result.current.currentFilters).toEqual([]);
  });
});
