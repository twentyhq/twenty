import { type FindRecordsOutputSchema } from '@/workflow/workflow-variables/types/FindRecordsOutputSchema';
import { type RecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { searchVariableThroughFindRecordsOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughFindRecordsOutputSchema';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('searchVariableThroughFindRecordsOutputSchema', () => {
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

  const mockSearchRecordSchema: FindRecordsOutputSchema = {
    first: {
      isLeaf: false,
      label: 'First',
      value: mockRecordSchema,
    },
    all: {
      isLeaf: true,
      label: 'All',
      value: 'Returns an array of records',
      type: 'array',
    },
    totalCount: {
      isLeaf: true,
      label: 'Total Count',
      value: 42,
      type: 'number',
    },
  };

  it('should handle totalCount variable correctly', () => {
    const result = searchVariableThroughFindRecordsOutputSchema({
      stepName: 'Find Companies',
      searchRecordOutputSchema: mockSearchRecordSchema,
      rawVariableName: '{{step1.totalCount}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: 'Total Count',
      variablePathLabel: 'Find Companies > Total Count',
      variableType: FieldMetadataType.NUMBER,
    });
  });

  it('should handle first record field access correctly', () => {
    const result = searchVariableThroughFindRecordsOutputSchema({
      stepName: 'Find Companies',
      searchRecordOutputSchema: mockSearchRecordSchema,
      rawVariableName: '{{step1.first.name}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: 'Company Name',
      variablePathLabel: 'Find Companies > First > Company Name',
      variableType: FieldMetadataType.TEXT,
      fieldMetadataId: 'company-name-metadata-id',
      compositeFieldSubFieldName: undefined,
    });
  });

  it('should handle all records access correctly', () => {
    const result = searchVariableThroughFindRecordsOutputSchema({
      stepName: 'Find Companies',
      searchRecordOutputSchema: mockSearchRecordSchema,
      rawVariableName: '{{step1.all}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: 'All',
      variablePathLabel: 'Find Companies > All',
      variableType: FieldMetadataType.ARRAY,
    });
  });

  it('should return undefined for invalid field name', () => {
    const result = searchVariableThroughFindRecordsOutputSchema({
      stepName: 'Find Companies',
      searchRecordOutputSchema: mockSearchRecordSchema,
      rawVariableName: '{{step1.first.invalidField}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: undefined,
      variablePathLabel: undefined,
    });
  });

  it('should return undefined for invalid search result key', () => {
    const result = searchVariableThroughFindRecordsOutputSchema({
      stepName: 'Find Companies',
      searchRecordOutputSchema: mockSearchRecordSchema,
      rawVariableName: '{{step1.invalid.name}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: undefined,
      variablePathLabel: undefined,
    });
  });

  it('should return undefined when searchRecordOutputSchema is undefined', () => {
    const result = searchVariableThroughFindRecordsOutputSchema({
      stepName: 'Find Companies',
      searchRecordOutputSchema: undefined as any,
      rawVariableName: '{{step1.first.name}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: undefined,
      variablePathLabel: undefined,
    });
  });

  it('should return undefined when stepId or searchResultKey is undefined', () => {
    const result = searchVariableThroughFindRecordsOutputSchema({
      stepName: 'Find Companies',
      searchRecordOutputSchema: mockSearchRecordSchema,
      rawVariableName: '{{}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: undefined,
      variablePathLabel: undefined,
    });
  });
});
