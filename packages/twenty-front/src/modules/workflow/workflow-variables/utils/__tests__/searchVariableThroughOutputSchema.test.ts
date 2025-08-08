import { StepOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';
import { searchVariableThroughOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughOutputSchema';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('searchVariableThroughOutputSchema', () => {
  describe('step tests', () => {
    const mockStep = {
      id: 'step-1',
      name: 'Step 1',
      outputSchema: {
        company: {
          isLeaf: false,
          icon: 'company',
          label: 'Company',
          value: {
            object: {
              nameSingular: 'company',
              fieldIdName: 'id',
              label: 'Company',
              value: 'John',
              isLeaf: true,
              objectMetadataId: '123',
            },
            fields: {
              name: { label: 'Name', value: 'Twenty', isLeaf: true },
              address: { label: 'Address', value: '123 Main St', isLeaf: true },
            },
            _outputSchemaType: 'RECORD',
          },
        },
        person: {
          isLeaf: false,
          icon: 'person',
          label: 'Person',
          value: {
            object: {
              nameSingular: 'person',
              fieldIdName: 'id',
              label: 'Person',
              value: 'Jane',
              isLeaf: true,
              objectMetadataId: '123',
            },
            fields: {
              firstName: { label: 'First Name', value: 'Jane', isLeaf: true },
              lastName: { label: 'Last Name', value: 'Doe', isLeaf: true },
              email: {
                label: 'Email',
                value: 'jane@example.com',
                isLeaf: true,
              },
            },
            _outputSchemaType: 'RECORD',
          },
        },
        simpleData: {
          isLeaf: true,
          label: 'Simple Data',
          value: 'Simple value',
        },
        nestedData: {
          isLeaf: false,
          label: 'Nested Data',
          value: {
            field1: { label: 'Field 1', value: 'Value 1', isLeaf: true },
            field2: { label: 'Field 2', value: 'Value 2', isLeaf: true },
          },
        },
      },
    } satisfies StepOutputSchema;
    it('should not break with wrong path', () => {
      const result = searchVariableThroughOutputSchema({
        stepOutputSchema: mockStep,
        rawVariableName: '{{step-1.wrong.wrong.wrong}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: undefined,
        variablePathLabel: 'Step 1 > undefined',
        variableType: 'unknown',
      });
    });

    it('should find a company field variable', () => {
      const result = searchVariableThroughOutputSchema({
        stepOutputSchema: mockStep,
        rawVariableName: '{{step-1.company.name}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: 'Name',
        variablePathLabel: 'Step 1 > Company > Name',
        variableType: 'unknown',
      });
    });

    it('should find a person field variable', () => {
      const result = searchVariableThroughOutputSchema({
        stepOutputSchema: mockStep,
        rawVariableName: '{{step-1.person.email}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: 'Email',
        variablePathLabel: 'Step 1 > Person > Email',
        variableType: 'unknown',
      });
    });

    it('should find a company object variable', () => {
      const result = searchVariableThroughOutputSchema({
        stepOutputSchema: mockStep,
        rawVariableName: '{{step-1.company.id}}',
        isFullRecord: true,
      });

      expect(result).toEqual({
        variableLabel: 'Company',
        variablePathLabel: 'Step 1 > Company > Company',
        variableType: 'unknown',
      });
    });

    it('should find a person object variable', () => {
      const result = searchVariableThroughOutputSchema({
        stepOutputSchema: mockStep,
        rawVariableName: '{{step-1.person.id}}',
        isFullRecord: true,
      });

      expect(result).toEqual({
        variableLabel: 'Person',
        variablePathLabel: 'Step 1 > Person > Person',
        variableType: 'unknown',
      });
    });

    it('should handle simple data fields', () => {
      const result = searchVariableThroughOutputSchema({
        stepOutputSchema: mockStep,
        rawVariableName: '{{step-1.simpleData}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: 'Simple Data',
        variablePathLabel: 'Step 1 > Simple Data',
        variableType: 'unknown',
      });
    });

    it('should handle nested data fields', () => {
      const result = searchVariableThroughOutputSchema({
        stepOutputSchema: mockStep,
        rawVariableName: '{{step-1.nestedData.field1}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: 'Field 1',
        variablePathLabel: 'Step 1 > Nested Data > Field 1',
        variableType: 'unknown',
      });
    });

    it('should handle invalid variable names', () => {
      const result = searchVariableThroughOutputSchema({
        stepOutputSchema: mockStep,
        rawVariableName: '{{invalid}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: undefined,
        variablePathLabel: 'Step 1 > undefined',
        variableType: 'unknown',
      });
    });

    it('should handle non-existent paths', () => {
      const result = searchVariableThroughOutputSchema({
        stepOutputSchema: mockStep,
        rawVariableName: '{{step-1.nonExistent.field}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: undefined,
        variablePathLabel: 'Step 1 > undefined',
        variableType: 'unknown',
      });
    });

    it('should handle the case where the path has dots in field names', () => {
      const mockStepWithDotInField = {
        id: 'step-1',
        name: 'Step 1',
        outputSchema: {
          'complex.field': {
            isLeaf: false,
            label: 'Complex Field',
            value: {
              field1: { label: 'Field 1', value: 'Value 1', isLeaf: true },
              field2: { label: 'Field 2', value: 'Value 2', isLeaf: true },
            },
          },
        },
      } satisfies StepOutputSchema;

      const result = searchVariableThroughOutputSchema({
        stepOutputSchema: mockStepWithDotInField,
        rawVariableName: '{{step-1.complex.field.field1}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: 'Field 1',
        variablePathLabel: 'Step 1 > Complex Field > Field 1',
        variableType: 'unknown',
      });
    });
  });

  describe('trigger tests', () => {
    const mockTrigger = {
      id: 'trigger',
      name: 'Record is Created',
      icon: 'IconPlaylistAdd',
      outputSchema: {
        fields: {
          'properties.after.id': {
            icon: 'Icon123',
            type: FieldMetadataType.UUID,
            label: 'Id',
            value: '123e4567-e89b-12d3-a456-426614174000',
            isLeaf: true,
          },
          'properties.after.name': {
            icon: 'IconBuildingSkyscraper',
            type: FieldMetadataType.TEXT,
            label: 'Name',
            value: 'My text',
            isLeaf: true,
          },
          'properties.after.annualRecurringRevenue': {
            icon: 'IconMoneybag',
            label: 'ARR',
            value: {
              amountMicros: {
                type: FieldMetadataType.NUMERIC,
                label: ' Amount Micros',
                value: null,
                isLeaf: true,
              },
              currencyCode: {
                type: FieldMetadataType.TEXT,
                label: ' Currency Code',
                value: 'My text',
                isLeaf: true,
              },
            },
            isLeaf: false,
          },
        },
        object: {
          icon: 'IconBuildingSkyscraper',
          label: 'Company',
          value: 'A company',
          isLeaf: true,
          fieldIdName: 'properties.after.id',
          nameSingular: 'company',
          objectMetadataId: '123',
        },
        _outputSchemaType: 'RECORD',
      },
    } satisfies StepOutputSchema;
    it('should find a simple field from trigger', () => {
      const result = searchVariableThroughOutputSchema({
        stepOutputSchema: mockTrigger,
        rawVariableName: '{{trigger.properties.after.name}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: 'Name',
        variablePathLabel: 'Record is Created > Name',
        variableType: FieldMetadataType.TEXT,
      });
    });

    it('should find a nested field from trigger', () => {
      const result = searchVariableThroughOutputSchema({
        stepOutputSchema: mockTrigger,
        rawVariableName:
          '{{trigger.properties.after.annualRecurringRevenue.amountMicros}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: ' Amount Micros',
        variablePathLabel: 'Record is Created > ARR >  Amount Micros',
        variableType: FieldMetadataType.NUMERIC,
      });
    });

    it('should find the object field from trigger', () => {
      const result = searchVariableThroughOutputSchema({
        stepOutputSchema: mockTrigger,
        rawVariableName: '{{trigger.object}}',
        isFullRecord: true,
      });

      expect(result).toEqual({
        variableLabel: 'Company',
        variablePathLabel: 'Record is Created > Company',
        variableType: 'unknown',
      });
    });

    it('should handle invalid trigger field path', () => {
      const result = searchVariableThroughOutputSchema({
        stepOutputSchema: mockTrigger,
        rawVariableName: '{{trigger.nonExistent}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: undefined,
        variablePathLabel: 'Record is Created > undefined',
        variableType: 'unknown',
      });
    });
  });
});
