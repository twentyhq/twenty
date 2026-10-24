import { resolvePersistedStepOutputSchema } from '@/workflow/workflow-variables/utils/resolvePersistedStepOutputSchema';

const LEGACY_LINK_PLACEHOLDER = {
  link: { isLeaf: true, tab: 'test', label: 'Generate Function Output' },
  _outputSchemaType: 'LINK',
};

describe('resolvePersistedStepOutputSchema', () => {
  it('returns a tested output schema', () => {
    const outputSchema = {
      prefix: { isLeaf: true, type: 'string', label: 'Prefix', value: 'ABC' },
    };

    expect(
      resolvePersistedStepOutputSchema({
        stepType: 'CODE',
        settings: { outputSchema },
      }),
    ).toEqual(outputSchema);
  });

  it('falls back to the expected output over a stored link placeholder', () => {
    expect(
      resolvePersistedStepOutputSchema({
        stepType: 'CODE',
        settings: {
          outputSchema: LEGACY_LINK_PLACEHOLDER,
          expectedOutputSchema: { result: 42 },
        },
      }),
    ).toEqual({
      result: { isLeaf: true, type: 'number', value: 42, label: 'result' },
    });
  });

  it('treats a stored link placeholder as no output schema', () => {
    expect(
      resolvePersistedStepOutputSchema({
        stepType: 'CODE',
        settings: { outputSchema: LEGACY_LINK_PLACEHOLDER },
      }),
    ).toEqual({});
  });
});
