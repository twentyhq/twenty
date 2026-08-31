import { getStepFilterVariableSelectionSettings } from '@/workflow/workflow-steps/filters/utils/getStepFilterVariableSelectionSettings';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

describe('getStepFilterVariableSelectionSettings', () => {
  it('uses the variable type and resets to its default operand', () => {
    expect(
      getStepFilterVariableSelectionSettings({
        rawVariableName: '{{find.totalCount}}',
        isFullRecord: false,
        variableType: 'number',
        fieldMetadataId: undefined,
        fieldMetadataType: undefined,
        compositeFieldSubFieldName: undefined,
      }),
    ).toEqual({
      stepOutputKey: '{{find.totalCount}}',
      isFullRecord: false,
      type: 'number',
      fieldMetadataId: undefined,
      compositeFieldSubFieldName: undefined,
      operand: ViewFilterOperand.IS,
    });
  });

  it('uses field metadata and composite subfield behavior', () => {
    expect(
      getStepFilterVariableSelectionSettings({
        rawVariableName: '{{trigger.amount.currencyCode}}',
        isFullRecord: false,
        variableType: 'string',
        fieldMetadataId: 'amount',
        fieldMetadataType: FieldMetadataType.CURRENCY,
        compositeFieldSubFieldName: 'currencyCode',
      }),
    ).toEqual({
      stepOutputKey: '{{trigger.amount.currencyCode}}',
      isFullRecord: false,
      type: FieldMetadataType.CURRENCY,
      fieldMetadataId: 'amount',
      compositeFieldSubFieldName: 'currencyCode',
      operand: ViewFilterOperand.IS,
    });
  });

  it('retains whole-record selection', () => {
    expect(
      getStepFilterVariableSelectionSettings({
        rawVariableName: '{{find.first.id}}',
        isFullRecord: true,
        variableType: 'string',
        fieldMetadataId: undefined,
        fieldMetadataType: undefined,
        compositeFieldSubFieldName: undefined,
      }),
    ).toEqual(
      expect.objectContaining({
        stepOutputKey: '{{find.first.id}}',
        isFullRecord: true,
      }),
    );
  });
});
