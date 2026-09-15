import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { searchVariableThroughOutputSchemaV2 } from '@/workflow/workflow-variables/utils/searchVariableThroughOutputSchemaV2';

describe('searchVariableThroughOutputSchemaV2', () => {
  const stepOutputSchema: StepOutputSchemaV2 = {
    id: 'step-1',
    name: 'HTTP Request',
    type: 'CODE',
    outputSchema: {
      message: {
        isLeaf: true,
        type: 'string',
        label: 'Message',
        value: 'Hello World',
      },
    },
  };

  it('should resolve a variable through the shared dispatcher', () => {
    const result = searchVariableThroughOutputSchemaV2({
      stepOutputSchema,
      stepType: 'CODE',
      rawVariableName: '{{step-1.message}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: 'Message',
      variablePathLabel: 'HTTP Request > Message',
      variableType: 'string',
    });
  });

  it('should return an empty result for an unknown variable path', () => {
    const result = searchVariableThroughOutputSchemaV2({
      stepOutputSchema,
      stepType: 'CODE',
      rawVariableName: '{{step-1.unknownField}}',
      isFullRecord: false,
    });

    expect(result.variableLabel).toBeUndefined();
    expect(result.variablePathLabel).toBeUndefined();
  });
});
