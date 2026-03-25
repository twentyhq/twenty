import type { CodeOutputSchema } from '@/workflow/workflow-variables/types/CodeOutputSchema';
import { searchVariableThroughCodeOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughCodeOutputSchema';
import type { BaseOutputSchemaV2 } from 'twenty-shared/workflow';

describe('searchVariableThroughCodeOutputSchema', () => {
  describe('LinkOutputSchema tests', () => {
    const mockLinkSchema: CodeOutputSchema = {
      link: {
        isLeaf: true,
        tab: 'main',
        label: 'External Link',
      },
      _outputSchemaType: 'LINK',
    };

    it('should return undefined', () => {
      const result = searchVariableThroughCodeOutputSchema({
        stepName: 'Code Step',
        codeOutputSchema: mockLinkSchema,
        rawVariableName: '{{step1.link}}',
      });

      expect(result).toEqual({
        variableLabel: undefined,
        variablePathLabel: undefined,
      });
    });
  });

  describe('BaseOutputSchemaV2 tests', () => {
    const mockBaseSchema: BaseOutputSchemaV2 = {
      message: {
        isLeaf: true,
        type: 'string',
        label: 'Response Message',
        value: 'Success',
      },
      data: {
        isLeaf: false,
        type: 'object',
        label: 'Response Data',
        value: {
          userId: {
            isLeaf: true,
            type: 'number',
            label: 'User ID',
            value: 123,
          },
          profile: {
            isLeaf: false,
            type: 'object',
            label: 'User Profile',
            value: {
              name: {
                isLeaf: true,
                type: 'string',
                label: 'Full Name',
                value: 'John Doe',
              },
              email: {
                isLeaf: true,
                type: 'string',
                label: 'Email Address',
                value: 'john@example.com',
              },
            },
          },
        },
      },
      count: {
        isLeaf: true,
        type: 'number',
        label: 'Item Count',
        value: 42,
      },
      isEnabled: {
        isLeaf: true,
        type: 'boolean',
        label: 'Is Enabled',
        value: true,
      },
    };

    it('should handle simple string field access correctly', () => {
      const result = searchVariableThroughCodeOutputSchema({
        stepName: 'Code Action',
        codeOutputSchema: mockBaseSchema,
        rawVariableName: '{{step1.message}}',
      });

      expect(result).toEqual({
        variableLabel: 'Response Message',
        variablePathLabel: 'Code Action > Response Message',
        variableType: 'string',
      });
    });

    it('should handle simple number field access correctly', () => {
      const result = searchVariableThroughCodeOutputSchema({
        stepName: 'Code Action',
        codeOutputSchema: mockBaseSchema,
        rawVariableName: '{{step1.count}}',
      });

      expect(result).toEqual({
        variableLabel: 'Item Count',
        variablePathLabel: 'Code Action > Item Count',
        variableType: 'number',
      });
    });

    it('should handle simple boolean field access correctly', () => {
      const result = searchVariableThroughCodeOutputSchema({
        stepName: 'Code Action',
        codeOutputSchema: mockBaseSchema,
        rawVariableName: '{{step1.isEnabled}}',
      });

      expect(result).toEqual({
        variableLabel: 'Is Enabled',
        variablePathLabel: 'Code Action > Is Enabled',
        variableType: 'boolean',
      });
    });

    it('should handle nested object field access correctly', () => {
      const result = searchVariableThroughCodeOutputSchema({
        stepName: 'Code Action',
        codeOutputSchema: mockBaseSchema,
        rawVariableName: '{{step1.data.userId}}',
      });

      expect(result).toEqual({
        variableLabel: 'User ID',
        variablePathLabel: 'Code Action > Response Data > User ID',
        variableType: 'number',
      });
    });

    it('should handle deeply nested object field access correctly', () => {
      const result = searchVariableThroughCodeOutputSchema({
        stepName: 'Code Action',
        codeOutputSchema: mockBaseSchema,
        rawVariableName: '{{step1.data.profile.name}}',
      });

      expect(result).toEqual({
        variableLabel: 'Full Name',
        variablePathLabel:
          'Code Action > Response Data > User Profile > Full Name',
        variableType: 'string',
      });
    });

    it('should handle deeply nested email field access correctly', () => {
      const result = searchVariableThroughCodeOutputSchema({
        stepName: 'Code Action',
        codeOutputSchema: mockBaseSchema,
        rawVariableName: '{{step1.data.profile.email}}',
      });

      expect(result).toEqual({
        variableLabel: 'Email Address',
        variablePathLabel:
          'Code Action > Response Data > User Profile > Email Address',
        variableType: 'string',
      });
    });

    it('should handle object field access (returns object info)', () => {
      const result = searchVariableThroughCodeOutputSchema({
        stepName: 'Code Action',
        codeOutputSchema: mockBaseSchema,
        rawVariableName: '{{step1.data}}',
      });

      expect(result).toEqual({
        variableLabel: 'Response Data',
        variablePathLabel: 'Code Action > Response Data',
        variableType: 'object',
      });
    });

    it('should return undefined for invalid field name', () => {
      const result = searchVariableThroughCodeOutputSchema({
        stepName: 'Code Action',
        codeOutputSchema: mockBaseSchema,
        rawVariableName: '{{step1.invalidField}}',
      });

      expect(result).toEqual({
        variableLabel: undefined,
        variablePathLabel: undefined,
      });
    });

    it('should return undefined for invalid nested field name', () => {
      const result = searchVariableThroughCodeOutputSchema({
        stepName: 'Code Action',
        codeOutputSchema: mockBaseSchema,
        rawVariableName: '{{step1.data.invalidField}}',
      });

      expect(result).toEqual({
        variableLabel: undefined,
        variablePathLabel: undefined,
      });
    });
  });

  describe('Edge cases', () => {
    const mockBaseSchema: BaseOutputSchemaV2 = {
      simpleField: {
        isLeaf: true,
        type: 'string',
        label: 'Simple Field',
        value: 'test',
      },
    };

    it('should return undefined when codeOutputSchema is undefined', () => {
      const result = searchVariableThroughCodeOutputSchema({
        stepName: 'Code Action',
        codeOutputSchema: undefined as any,
        rawVariableName: '{{step1.message}}',
      });

      expect(result).toEqual({
        variableLabel: undefined,
        variablePathLabel: undefined,
      });
    });

    it('should return undefined when stepId or fieldName is undefined', () => {
      const result = searchVariableThroughCodeOutputSchema({
        stepName: 'Code Action',
        codeOutputSchema: mockBaseSchema,
        rawVariableName: '{{}}',
      });

      expect(result).toEqual({
        variableLabel: undefined,
        variablePathLabel: undefined,
      });
    });

    it('should handle variables without curly braces', () => {
      const result = searchVariableThroughCodeOutputSchema({
        stepName: 'Code Action',
        codeOutputSchema: mockBaseSchema,
        rawVariableName: 'step1.simpleField',
      });

      expect(result).toEqual({
        variableLabel: 'Simple Field',
        variablePathLabel: 'Code Action > Simple Field',
        variableType: 'string',
      });
    });
  });
});
