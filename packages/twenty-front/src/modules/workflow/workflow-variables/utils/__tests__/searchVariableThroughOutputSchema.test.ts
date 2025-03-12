import { StepOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';
import { searchVariableThroughOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughOutputSchema';

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
        },
        fields: {
          firstName: { label: 'First Name', value: 'Jane', isLeaf: true },
          lastName: { label: 'Last Name', value: 'Doe', isLeaf: true },
          email: { label: 'Email', value: 'jane@example.com', isLeaf: true },
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

describe('searchVariableThroughOutputSchema', () => {
  it('should find a company field variable', () => {
    const result = searchVariableThroughOutputSchema({
      stepOutputSchema: mockStep,
      rawVariableName: '{{step-1.company.name}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: 'Name',
      variablePathLabel: 'Step 1 > Company > Name',
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
    });
  });
});
