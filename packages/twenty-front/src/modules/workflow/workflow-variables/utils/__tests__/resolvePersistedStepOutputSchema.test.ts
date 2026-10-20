import { resolvePersistedStepOutputSchema } from '@/workflow/workflow-variables/utils/resolvePersistedStepOutputSchema';

describe('resolvePersistedStepOutputSchema', () => {
  it('returns translated outputSchema when outputSchema is a BaseOutputSchemaV2', () => {
    const outputSchema = {
      prefix: {
        isLeaf: true,
        type: 'string',
        label: 'Prefix',
        value: 'ABC',
      },
      siteCode: {
        isLeaf: true,
        type: 'string',
        label: 'Site Code',
        value: 'XYZ',
      },
    };

    const result = resolvePersistedStepOutputSchema({
      stepType: 'CODE',
      settings: {
        outputSchema,
      },
    });

    expect(result).toEqual(outputSchema);
  });

  it('returns expectedOutputSchema when outputSchema is absent', () => {
    const expectedOutputSchema = {
      prefix: 'ABC',
      siteCode: 'XYZ',
    };

    const result = resolvePersistedStepOutputSchema({
      stepType: 'CODE',
      settings: {
        expectedOutputSchema,
      },
    });

    expect(result).toEqual({
      prefix: {
        isLeaf: true,
        type: 'string',
        value: 'ABC',
        label: 'prefix',
      },
      siteCode: {
        isLeaf: true,
        type: 'string',
        value: 'XYZ',
        label: 'siteCode',
      },
    });
  });

  it('returns expectedOutputSchema when outputSchema is a LinkOutputSchema', () => {
    const linkOutputSchema = {
      link: {
        isLeaf: true as const,
        tab: 'test',
        label: 'Generate Function Output',
      },
      _outputSchemaType: 'LINK' as const,
    };
    const expectedOutputSchema = {
      result: 42,
    };

    const result = resolvePersistedStepOutputSchema({
      stepType: 'CODE',
      settings: {
        outputSchema: linkOutputSchema,
        expectedOutputSchema,
      },
    });

    expect(result).toEqual({
      result: {
        isLeaf: true,
        type: 'number',
        value: 42,
        label: 'result',
      },
    });
  });

  it('returns link output schema when outputSchema is a LinkOutputSchema and no expectedOutputSchema', () => {
    const linkOutputSchema = {
      link: {
        isLeaf: true as const,
        tab: 'test',
        label: 'Generate Function Output',
      },
      _outputSchemaType: 'LINK' as const,
    };

    const result = resolvePersistedStepOutputSchema({
      stepType: 'CODE',
      settings: {
        outputSchema: linkOutputSchema,
      },
    });

    expect(result).toEqual(linkOutputSchema);
  });

  it('returns AI_AGENT default output schema when stepType is AI_AGENT and outputSchema is not present', () => {
    const result = resolvePersistedStepOutputSchema({
      stepType: 'AI_AGENT',
      settings: {},
    });

    expect(result).toEqual({
      response: {
        isLeaf: true,
        type: 'string',
        label: 'Response',
        value: null,
      },
    });
  });

  it('returns empty object when settings is empty or undefined', () => {
    expect(
      resolvePersistedStepOutputSchema({
        stepType: 'CODE',
        settings: undefined,
      }),
    ).toEqual({});

    expect(
      resolvePersistedStepOutputSchema({
        stepType: 'CODE',
        settings: {},
      }),
    ).toEqual({});
  });
});
