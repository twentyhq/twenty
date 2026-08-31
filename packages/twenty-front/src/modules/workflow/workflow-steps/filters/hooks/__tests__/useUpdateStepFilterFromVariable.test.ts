import { useUpdateStepFilterFromVariable } from '@/workflow/workflow-steps/filters/hooks/useUpdateStepFilterFromVariable';
import { renderHook } from '@testing-library/react';
import {
  FieldMetadataType,
  ViewFilterOperand,
  type StepFilter,
} from 'twenty-shared/types';

const mockUpsertStepFilterSettings = jest.fn();
const mockGetInitialFilterValue = jest.fn(() => ({ value: '' }));
const mockSearchVariable = jest.fn();
const mockGetSchema = jest.fn(() => [{}]);

jest.mock('@/workflow/hooks/useWorkflowVersionIdOrThrow', () => ({
  useWorkflowVersionIdOrThrow: () => 'version',
}));
jest.mock(
  '@/workflow/states/selectors/stepsOutputSchemaFamilySelector',
  () => ({ stepsOutputSchemaFamilySelector: { selectorFamily: jest.fn() } }),
);
jest.mock('jotai', () => ({ useStore: () => ({ get: mockGetSchema }) }));
jest.mock(
  '@/workflow/workflow-variables/utils/searchVariableThroughOutputSchemaV2',
  () => ({
    searchVariableThroughOutputSchemaV2: (options: unknown) =>
      mockSearchVariable(options),
  }),
);
jest.mock('@/object-metadata/hooks/useGetFieldMetadataItemById', () => ({
  useGetFieldMetadataItemByIdOrThrow: () => ({
    getFieldMetadataItemByIdOrThrow: () => ({
      fieldMetadataItem: { type: 'CURRENCY' },
    }),
  }),
}));
jest.mock(
  '@/object-record/object-filter-dropdown/hooks/useGetInitialFilterValue',
  () => ({
    useGetInitialFilterValue: () => ({
      getInitialFilterValue: mockGetInitialFilterValue,
    }),
  }),
);
jest.mock(
  '@/workflow/workflow-steps/filters/hooks/useUpsertStepFilterSettings',
  () => ({
    useUpsertStepFilterSettings: () => ({
      upsertStepFilterSettings: mockUpsertStepFilterSettings,
    }),
  }),
);

const STEP_FILTER: StepFilter = {
  id: 'filter',
  stepFilterGroupId: 'group',
  type: 'string',
  stepOutputKey: '{{old.value}}',
  operand: ViewFilterOperand.IS,
  value: 'old value',
  positionInStepFilterGroup: 2,
};

describe('useUpdateStepFilterFromVariable', () => {
  beforeEach(() => jest.clearAllMocks());

  it('selects a search result using its source type and resets the operand and value', () => {
    mockSearchVariable.mockReturnValue({ variableType: 'number' });
    const { result } = renderHook(() =>
      useUpdateStepFilterFromVariable({ stepFilter: STEP_FILTER }),
    );
    result.current.updateStepFilterFromVariable({
      rawVariableName: '{{find.totalCount}}',
      stepType: 'FIND_RECORDS',
      isFullRecord: false,
    });

    expect(mockSearchVariable).toHaveBeenCalledWith(
      expect.objectContaining({
        rawVariableName: '{{find.totalCount}}',
        stepType: 'FIND_RECORDS',
      }),
    );
    expect(mockUpsertStepFilterSettings).toHaveBeenCalledWith({
      stepFilterToUpsert: expect.objectContaining({
        id: 'filter',
        stepFilterGroupId: 'group',
        positionInStepFilterGroup: 2,
        stepOutputKey: '{{find.totalCount}}',
        type: 'number',
        value: '',
        isFullRecord: false,
      }),
    });
    expect(mockGetInitialFilterValue).toHaveBeenCalledWith(
      'number',
      expect.any(String),
    );
  });

  it('preserves field metadata and composite subfield behavior', () => {
    mockSearchVariable.mockReturnValue({
      variableType: 'string',
      fieldMetadataId: 'amount',
      compositeFieldSubFieldName: 'currencyCode',
    });
    const { result } = renderHook(() =>
      useUpdateStepFilterFromVariable({ stepFilter: STEP_FILTER }),
    );
    result.current.updateStepFilterFromVariable({
      rawVariableName: '{{trigger.amount.currencyCode}}',
      stepType: 'DATABASE_EVENT',
      isFullRecord: false,
    });

    expect(mockUpsertStepFilterSettings).toHaveBeenCalledWith({
      stepFilterToUpsert: expect.objectContaining({
        type: FieldMetadataType.CURRENCY,
        fieldMetadataId: 'amount',
        compositeFieldSubFieldName: 'currencyCode',
        operand: ViewFilterOperand.IS,
      }),
    });
  });

  it('retains full-record selection from the nested picker', () => {
    mockSearchVariable.mockReturnValue({ variableType: 'string' });
    const { result } = renderHook(() =>
      useUpdateStepFilterFromVariable({ stepFilter: STEP_FILTER }),
    );
    result.current.updateStepFilterFromVariable({
      rawVariableName: '{{find.first.id}}',
      stepType: 'FIND_RECORDS',
      isFullRecord: true,
    });
    expect(mockUpsertStepFilterSettings).toHaveBeenCalledWith({
      stepFilterToUpsert: expect.objectContaining({
        isFullRecord: true,
        stepOutputKey: '{{find.first.id}}',
      }),
    });
  });
});
