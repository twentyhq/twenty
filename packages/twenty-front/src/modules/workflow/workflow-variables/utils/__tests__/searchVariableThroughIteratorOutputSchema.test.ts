import { type IteratorOutputSchema } from '@/workflow/workflow-variables/types/IteratorOutputSchema';
import { type RecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { searchVariableThroughIteratorOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughIteratorOutputSchema';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('searchVariableThroughIteratorOutputSchema', () => {
  const mockRecordSchema: RecordOutputSchemaV2 = {
    object: {
      objectMetadataId: 'company-metadata-id',
      label: 'Company',
    },
    fields: {
      name: {
        isLeaf: true,
        type: FieldMetadataType.TEXT,
        label: 'Company Name',
        value: 'Acme Corp',
        fieldMetadataId: 'company-name-metadata-id',
        isCompositeSubField: false,
      },
      revenue: {
        isLeaf: true,
        type: FieldMetadataType.NUMBER,
        label: 'Revenue',
        value: 1000000,
        fieldMetadataId: 'company-revenue-metadata-id',
        isCompositeSubField: false,
      },
    },
    _outputSchemaType: 'RECORD',
  };

  const mockIteratorSchema: IteratorOutputSchema = {
    currentItem: {
      isLeaf: false,
      label: 'Current Item',
      value: mockRecordSchema,
    },
    currentItemIndex: 0,
    hasProcessedAllItems: false,
  };

  it('should handle currentItemIndex variable correctly', () => {
    const result = searchVariableThroughIteratorOutputSchema({
      stepName: 'Iterate Companies',
      iteratorOutputSchema: mockIteratorSchema,
      rawVariableName: '{{step1.currentItemIndex}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: 'Current Item Index',
      variablePathLabel: 'Iterate Companies > Current Item Index',
      variableType: FieldMetadataType.NUMBER,
    });
  });

  it('should handle hasProcessedAllItems variable correctly', () => {
    const result = searchVariableThroughIteratorOutputSchema({
      stepName: 'Iterate Companies',
      iteratorOutputSchema: mockIteratorSchema,
      rawVariableName: '{{step1.hasProcessedAllItems}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: 'Has Processed All Items',
      variablePathLabel: 'Iterate Companies > Has Processed All Items',
      variableType: FieldMetadataType.BOOLEAN,
    });
  });

  it('should handle currentItem field access correctly', () => {
    const result = searchVariableThroughIteratorOutputSchema({
      stepName: 'Iterate Companies',
      iteratorOutputSchema: mockIteratorSchema,
      rawVariableName: '{{step1.currentItem.name}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: 'Company Name',
      variablePathLabel: 'Iterate Companies > Current Item > Company Name',
      variableType: FieldMetadataType.TEXT,
      fieldMetadataId: 'company-name-metadata-id',
      compositeFieldSubFieldName: undefined,
    });
  });

  it('should return undefined for invalid field name', () => {
    const result = searchVariableThroughIteratorOutputSchema({
      stepName: 'Iterate Companies',
      iteratorOutputSchema: mockIteratorSchema,
      rawVariableName: '{{step1.currentItem.invalidField}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: undefined,
      variablePathLabel: undefined,
    });
  });

  it('should return undefined for invalid iterator result key', () => {
    const result = searchVariableThroughIteratorOutputSchema({
      stepName: 'Iterate Companies',
      iteratorOutputSchema: mockIteratorSchema,
      rawVariableName: '{{step1.invalid.name}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: undefined,
      variablePathLabel: undefined,
    });
  });

  it('should return undefined when iteratorOutputSchema is undefined', () => {
    const result = searchVariableThroughIteratorOutputSchema({
      stepName: 'Iterate Companies',
      iteratorOutputSchema: undefined as any,
      rawVariableName: '{{step1.currentItem.name}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: undefined,
      variablePathLabel: undefined,
    });
  });

  it('should return undefined when stepId or iteratorResultKey is undefined', () => {
    const result = searchVariableThroughIteratorOutputSchema({
      stepName: 'Iterate Companies',
      iteratorOutputSchema: mockIteratorSchema,
      rawVariableName: '{{}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: undefined,
      variablePathLabel: undefined,
    });
  });
});
