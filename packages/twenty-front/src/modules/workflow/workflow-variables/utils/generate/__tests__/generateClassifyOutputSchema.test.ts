import { generateClassifyOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateClassifyOutputSchema';

describe('generateClassifyOutputSchema', () => {
  it('should key answers by question name so variables stay readable', () => {
    const outputSchema = generateClassifyOutputSchema([
      {
        id: '4ef0a3b8-1f4a-4b3e-9c2d-2a1f5b6c7d8e',
        name: 'intent',
        type: 'choice',
        instructions: 'What does the message ask for?',
        criteria: [
          { id: 'c1', name: 'pricing' },
          { id: 'c2', name: 'support' },
        ],
      },
    ]);

    expect(outputSchema.answers).toEqual({
      isLeaf: false,
      type: 'object',
      label: 'Answers',
      value: {
        intent: {
          isLeaf: false,
          type: 'object',
          label: 'intent',
          value: {
            type: {
              isLeaf: true,
              type: 'string',
              label: 'Type',
              value: 'choice',
            },
            choice: {
              isLeaf: true,
              type: 'string',
              label: 'Choice',
              value: 'pricing',
            },
            probabilities: {
              isLeaf: false,
              type: 'object',
              label: 'Probabilities',
              value: {
                pricing: {
                  isLeaf: true,
                  type: 'number',
                  label: 'pricing',
                  value: 0,
                },
                support: {
                  isLeaf: true,
                  type: 'number',
                  label: 'support',
                  value: 0,
                },
              },
            },
          },
        },
      },
    });
  });

  it('should expose a score for a graded question', () => {
    const outputSchema = generateClassifyOutputSchema([
      {
        id: '4ef0a3b8-1f4a-4b3e-9c2d-2a1f5b6c7d8e',
        name: 'urgency',
        type: 'score',
        instructions: 'How urgent?',
        criteria: [
          { id: 'c1', name: 'Low' },
          { id: 'c2', name: 'High' },
        ],
      },
    ]);

    expect(
      (outputSchema.answers as { value: Record<string, { value: object }> })
        .value.urgency.value,
    ).toEqual({
      type: { isLeaf: true, type: 'string', label: 'Type', value: 'score' },
      score: { isLeaf: true, type: 'number', label: 'Score', value: 0 },
      probabilities: {
        isLeaf: false,
        type: 'object',
        label: 'Probabilities',
        value: {
          '0': { isLeaf: true, type: 'number', label: '0', value: 0 },
          '1': { isLeaf: true, type: 'number', label: '1', value: 0 },
        },
      },
    });
  });

  it('should expose a probability for a boolean question', () => {
    const outputSchema = generateClassifyOutputSchema([
      {
        id: '4ef0a3b8-1f4a-4b3e-9c2d-2a1f5b6c7d8e',
        name: 'isSpam',
        type: 'boolean',
        instructions: 'Is this spam?',
        criteria: [],
      },
    ]);

    expect(
      (outputSchema.answers as { value: Record<string, { value: object }> })
        .value.isSpam.value,
    ).toEqual({
      type: { isLeaf: true, type: 'string', label: 'Type', value: 'boolean' },
      probability: {
        isLeaf: true,
        type: 'number',
        label: 'Probability of true',
        value: 0,
      },
    });
  });

  // A half-written question would otherwise publish an empty variable name that
  // no downstream step can reference.
  it('should leave out questions that have no name yet', () => {
    const outputSchema = generateClassifyOutputSchema([
      {
        id: '4ef0a3b8-1f4a-4b3e-9c2d-2a1f5b6c7d8e',
        name: '',
        type: 'boolean',
        instructions: '',
        criteria: [],
      },
    ]);

    expect((outputSchema.answers as { value: object }).value).toEqual({});
  });
});
