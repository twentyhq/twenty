import { extractRawVariableNamePart } from 'twenty-shared/workflow';

describe('extractRawVariableNamePart', () => {
  it('returns the last part of a properly formatted variable', () => {
    const rawVariable = '{{a.b.c}}';

    expect(
      extractRawVariableNamePart({
        rawVariableName: rawVariable,
        part: 'selectedField',
      }),
    ).toBe('c');
  });

  it('returns the first part of a properly formatted variable', () => {
    const rawVariable = '{{a.b.c}}';

    expect(
      extractRawVariableNamePart({
        rawVariableName: rawVariable,
        part: 'stepId',
      }),
    ).toBe('a');
  });

  it('stops on unclosed variables', () => {
    const rawVariable = '{{ test {{a.b.c}}';

    expect(
      extractRawVariableNamePart({
        rawVariableName: rawVariable,
        part: 'selectedField',
      }),
    ).toBe('c');
  });
});
