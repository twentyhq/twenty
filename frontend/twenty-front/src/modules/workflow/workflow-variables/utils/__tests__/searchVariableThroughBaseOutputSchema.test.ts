import { searchVariableThroughBaseOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughBaseOutputSchema';
import type { BaseOutputSchemaV2 } from 'twenty-shared/workflow';

describe('searchVariableThroughBaseOutputSchema', () => {
  const mockBaseSchema: BaseOutputSchemaV2 = {
    message: {
      isLeaf: true,
      type: 'string',
      label: 'Message',
      value: 'Hello World',
    },
    count: {
      isLeaf: true,
      type: 'number',
      label: 'Count',
      value: 42,
    },
    isSuccess: {
      isLeaf: true,
      type: 'boolean',
      label: 'Success Status',
      value: true,
    },
    items: {
      isLeaf: true,
      type: 'array',
      label: 'Items List',
      value: ['item1', 'item2', 'item3'],
    },
    user: {
      isLeaf: false,
      type: 'object',
      label: 'User Information',
      value: {
        name: {
          isLeaf: true,
          type: 'string',
          label: 'Full Name',
          value: 'John Doe',
        },
        age: {
          isLeaf: true,
          type: 'number',
          label: 'Age',
          value: 30,
        },
        profile: {
          isLeaf: false,
          type: 'object',
          label: 'Profile',
          value: {
            email: {
              isLeaf: true,
              type: 'string',
              label: 'Email Address',
              value: 'john@example.com',
            },
            isActive: {
              isLeaf: true,
              type: 'boolean',
              label: 'Is Active',
              value: true,
            },
          },
        },
      },
    },
    config: {
      isLeaf: false,
      type: 'object',
      label: 'Configuration',
      value: {
        timeout: {
          isLeaf: true,
          type: 'number',
          label: 'Timeout (ms)',
          value: 5000,
        },
        retries: {
          isLeaf: true,
          type: 'number',
          label: 'Retry Count',
          value: 3,
        },
      },
    },
  };

  it('should handle simple string field access correctly', () => {
    const result = searchVariableThroughBaseOutputSchema({
      stepName: 'HTTP Request',
      baseOutputSchema: mockBaseSchema,
      rawVariableName: '{{step1.message}}',
    });

    expect(result).toEqual({
      variableLabel: 'Message',
      variablePathLabel: 'HTTP Request > Message',
      variableType: 'string',
    });
  });

  it('should handle simple number field access correctly', () => {
    const result = searchVariableThroughBaseOutputSchema({
      stepName: 'HTTP Request',
      baseOutputSchema: mockBaseSchema,
      rawVariableName: '{{step1.count}}',
    });

    expect(result).toEqual({
      variableLabel: 'Count',
      variablePathLabel: 'HTTP Request > Count',
      variableType: 'number',
    });
  });

  it('should handle simple boolean field access correctly', () => {
    const result = searchVariableThroughBaseOutputSchema({
      stepName: 'HTTP Request',
      baseOutputSchema: mockBaseSchema,
      rawVariableName: '{{step1.isSuccess}}',
    });

    expect(result).toEqual({
      variableLabel: 'Success Status',
      variablePathLabel: 'HTTP Request > Success Status',
      variableType: 'boolean',
    });
  });

  it('should handle array field access correctly', () => {
    const result = searchVariableThroughBaseOutputSchema({
      stepName: 'HTTP Request',
      baseOutputSchema: mockBaseSchema,
      rawVariableName: '{{step1.items}}',
    });

    expect(result).toEqual({
      variableLabel: 'Items List',
      variablePathLabel: 'HTTP Request > Items List',
      variableType: 'array',
    });
  });

  it('should handle nested object field access correctly', () => {
    const result = searchVariableThroughBaseOutputSchema({
      stepName: 'HTTP Request',
      baseOutputSchema: mockBaseSchema,
      rawVariableName: '{{step1.user.name}}',
    });

    expect(result).toEqual({
      variableLabel: 'Full Name',
      variablePathLabel: 'HTTP Request > User Information > Full Name',
      variableType: 'string',
    });
  });

  it('should handle deeply nested object field access correctly', () => {
    const result = searchVariableThroughBaseOutputSchema({
      stepName: 'HTTP Request',
      baseOutputSchema: mockBaseSchema,
      rawVariableName: '{{step1.user.profile.email}}',
    });

    expect(result).toEqual({
      variableLabel: 'Email Address',
      variablePathLabel:
        'HTTP Request > User Information > Profile > Email Address',
      variableType: 'string',
    });
  });

  it('should handle deeply nested boolean field access correctly', () => {
    const result = searchVariableThroughBaseOutputSchema({
      stepName: 'HTTP Request',
      baseOutputSchema: mockBaseSchema,
      rawVariableName: '{{step1.user.profile.isActive}}',
    });

    expect(result).toEqual({
      variableLabel: 'Is Active',
      variablePathLabel:
        'HTTP Request > User Information > Profile > Is Active',
      variableType: 'boolean',
    });
  });

  it('should handle config object field access correctly', () => {
    const result = searchVariableThroughBaseOutputSchema({
      stepName: 'Code Action',
      baseOutputSchema: mockBaseSchema,
      rawVariableName: '{{step1.config.timeout}}',
    });

    expect(result).toEqual({
      variableLabel: 'Timeout (ms)',
      variablePathLabel: 'Code Action > Configuration > Timeout (ms)',
      variableType: 'number',
    });
  });

  it('should return undefined for invalid field name', () => {
    const result = searchVariableThroughBaseOutputSchema({
      stepName: 'HTTP Request',
      baseOutputSchema: mockBaseSchema,
      rawVariableName: '{{step1.invalidField}}',
    });

    expect(result).toEqual({
      variableLabel: undefined,
      variablePathLabel: undefined,
    });
  });

  it('should return undefined for invalid nested field name', () => {
    const result = searchVariableThroughBaseOutputSchema({
      stepName: 'HTTP Request',
      baseOutputSchema: mockBaseSchema,
      rawVariableName: '{{step1.user.invalidField}}',
    });

    expect(result).toEqual({
      variableLabel: undefined,
      variablePathLabel: undefined,
    });
  });

  it('should return undefined for deeply invalid nested field name', () => {
    const result = searchVariableThroughBaseOutputSchema({
      stepName: 'HTTP Request',
      baseOutputSchema: mockBaseSchema,
      rawVariableName: '{{step1.user.profile.invalidField}}',
    });

    expect(result).toEqual({
      variableLabel: undefined,
      variablePathLabel: undefined,
    });
  });

  it('should return undefined when trying to access nested field on a leaf field', () => {
    const result = searchVariableThroughBaseOutputSchema({
      stepName: 'HTTP Request',
      baseOutputSchema: mockBaseSchema,
      rawVariableName: '{{step1.message.nestedField}}',
    });

    expect(result).toEqual({
      variableLabel: undefined,
      variablePathLabel: undefined,
    });
  });

  it('should return undefined when baseOutputSchema is undefined', () => {
    const result = searchVariableThroughBaseOutputSchema({
      stepName: 'HTTP Request',
      baseOutputSchema: undefined as any,
      rawVariableName: '{{step1.message}}',
    });

    expect(result).toEqual({
      variableLabel: undefined,
      variablePathLabel: undefined,
    });
  });

  it('should return undefined when stepId or fieldName is undefined', () => {
    const result = searchVariableThroughBaseOutputSchema({
      stepName: 'HTTP Request',
      baseOutputSchema: mockBaseSchema,
      rawVariableName: '{{}}',
    });

    expect(result).toEqual({
      variableLabel: undefined,
      variablePathLabel: undefined,
    });
  });

  it('should handle variables without curly braces', () => {
    const result = searchVariableThroughBaseOutputSchema({
      stepName: 'HTTP Request',
      baseOutputSchema: mockBaseSchema,
      rawVariableName: 'step1.message',
    });

    expect(result).toEqual({
      variableLabel: 'Message',
      variablePathLabel: 'HTTP Request > Message',
      variableType: 'string',
    });
  });

  it('should handle object field access without target field (should return object info)', () => {
    const result = searchVariableThroughBaseOutputSchema({
      stepName: 'Code Action',
      baseOutputSchema: mockBaseSchema,
      rawVariableName: '{{step1.user}}',
    });

    expect(result).toEqual({
      variableLabel: 'User Information',
      variablePathLabel: 'Code Action > User Information',
      variableType: 'object',
    });
  });

  it('should handle unknown type field correctly', () => {
    const schemaWithUnknown: BaseOutputSchemaV2 = {
      unknownField: {
        isLeaf: true,
        type: 'unknown',
        label: 'Unknown Data',
        value: null,
      },
    };

    const result = searchVariableThroughBaseOutputSchema({
      stepName: 'AI Agent',
      baseOutputSchema: schemaWithUnknown,
      rawVariableName: '{{step1.unknownField}}',
    });

    expect(result).toEqual({
      variableLabel: 'Unknown Data',
      variablePathLabel: 'AI Agent > Unknown Data',
      variableType: 'unknown',
    });
  });
});
