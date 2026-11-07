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
      variableSelectionSettings: {
        stepOutputKey: '{{find.totalCount}}',
        isFullRecord: false,
        fieldMetadataId: undefined,
        compositeFieldSubFieldName: undefined,
        operand: ViewFilterOperand.IS,
      },
      filterType: 'number',
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
      variableSelectionSettings: {
        stepOutputKey: '{{trigger.amount.currencyCode}}',
        isFullRecord: false,
        fieldMetadataId: 'amount',
        compositeFieldSubFieldName: 'currencyCode',
        operand: ViewFilterOperand.IS,
      },
      filterType: FieldMetadataType.CURRENCY,
    });
  });

  it('normalizes morph relations to relation filters', () => {
    expect(
      getStepFilterVariableSelectionSettings({
        rawVariableName: '{{trigger.people.id}}',
        isFullRecord: false,
        variableType: 'string',
        fieldMetadataId: 'people',
        fieldMetadataType: FieldMetadataType.MORPH_RELATION,
        compositeFieldSubFieldName: undefined,
      }),
    ).toEqual(
      expect.objectContaining({
        variableSelectionSettings: expect.objectContaining({
          operand: ViewFilterOperand.IS,
        }),
        filterType: FieldMetadataType.RELATION,
      }),
    );
  });

  it('keeps field types without a specialized filter mapping', () => {
    expect(
      getStepFilterVariableSelectionSettings({
        rawVariableName: '{{trigger.description}}',
        isFullRecord: false,
        variableType: 'string',
        fieldMetadataId: 'description',
        fieldMetadataType: FieldMetadataType.RICH_TEXT,
        compositeFieldSubFieldName: undefined,
      }).filterType,
    ).toBe(FieldMetadataType.RICH_TEXT);
  });

  it('is unknown when the field cannot be found', () => {
    expect(
      getStepFilterVariableSelectionSettings({
        rawVariableName: '{{trigger.deleted}}',
        isFullRecord: false,
        variableType: 'string',
        fieldMetadataId: 'deleted',
        fieldMetadataType: undefined,
        compositeFieldSubFieldName: undefined,
      }).filterType,
    ).toBe('unknown');
  });

  it('retains whole-record selection without storing a type', () => {
    const { variableSelectionSettings } =
      getStepFilterVariableSelectionSettings({
        rawVariableName: '{{find.first.id}}',
        isFullRecord: true,
        variableType: 'string',
        fieldMetadataId: undefined,
        fieldMetadataType: undefined,
        compositeFieldSubFieldName: undefined,
      });

    expect(variableSelectionSettings).toEqual(
      expect.objectContaining({
        stepOutputKey: '{{find.first.id}}',
        isFullRecord: true,
      }),
    );
    expect(variableSelectionSettings).not.toHaveProperty('type');
  });
});
