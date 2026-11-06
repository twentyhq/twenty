import { getOutputSchemaFromValue } from 'twenty-shared/logic-function';

import { moveStepOutputSamplesToExpectedOutput } from 'src/database/commands/upgrade-version-command/2-57/utils/move-step-output-samples-to-expected-output.util';

const buildStep = (
  type: string,
  settings: Record<string, unknown>,
): Record<string, unknown> => ({
  id: `${type}-step`,
  type,
  settings: { input: {}, ...settings },
});

describe('moveStepOutputSamplesToExpectedOutput', () => {
  const declaredOutputSchemaByLogicFunctionId = new Map<string, unknown>();

  it('moves a code test result into expectedOutputSchema', () => {
    const testResult = { total: 3, customer: { name: 'Acme' }, tags: ['a'] };
    const step = buildStep('CODE', {
      outputSchema: getOutputSchemaFromValue(testResult),
      expectedOutputSchema: {},
    });

    const { steps, movedStepIds } = moveStepOutputSamplesToExpectedOutput({
      steps: [step],
      declaredOutputSchemaByLogicFunctionId,
    });

    expect(movedStepIds).toEqual(['CODE-step']);
    expect(steps).toEqual([
      {
        ...step,
        settings: {
          ...(step.settings as object),
          expectedOutputSchema: testResult,
        },
      },
    ]);
  });

  it('keeps a test result over a different expected output, as the builder did', () => {
    const testResult = { total: 3 };
    const step = buildStep('LOGIC_FUNCTION', {
      outputSchema: getOutputSchemaFromValue(testResult),
      expectedOutputSchema: { typed: 'by hand' },
    });

    const { steps } = moveStepOutputSamplesToExpectedOutput({
      steps: [step],
      declaredOutputSchemaByLogicFunctionId,
    });

    expect(
      (
        (steps as Record<string, unknown>[])[0].settings as Record<
          string,
          unknown
        >
      ).expectedOutputSchema,
    ).toEqual(testResult);
  });

  it('turns a flattened array schema back into an array', () => {
    const testResult = [{ id: 1 }, { id: 2 }];
    const step = buildStep('CODE', {
      outputSchema: getOutputSchemaFromValue(testResult),
    });

    const { steps } = moveStepOutputSamplesToExpectedOutput({
      steps: [step],
      declaredOutputSchemaByLogicFunctionId,
    });

    expect(
      (
        (steps as Record<string, unknown>[])[0].settings as Record<
          string,
          unknown
        >
      ).expectedOutputSchema,
    ).toEqual(testResult);
  });

  it('leaves steps whose schema already derives from their expected output', () => {
    const sample = { status: 200 };
    const httpStep = buildStep('HTTP_REQUEST', {
      outputSchema: getOutputSchemaFromValue(sample),
      expectedOutputSchema: sample,
    });
    const emptyCodeStep = buildStep('CODE', { outputSchema: {} });
    const recordStep = buildStep('CREATE_RECORD', {
      outputSchema: { anything: { isLeaf: true, value: 1 } },
    });
    const value = [httpStep, emptyCodeStep, recordStep];

    const { steps, movedStepIds } = moveStepOutputSamplesToExpectedOutput({
      steps: value,
      declaredOutputSchemaByLogicFunctionId,
    });

    expect(movedStepIds).toEqual([]);
    expect(steps).toBe(value);
  });

  it('leaves a logic function step showing its declared schema', () => {
    const declaredOutputSchema = {
      result: { isLeaf: true, type: 'string', label: 'result', value: '' },
    };
    const step = buildStep('LOGIC_FUNCTION', {
      input: { logicFunctionId: 'function-id' },
      outputSchema: declaredOutputSchema,
    });

    const { movedStepIds } = moveStepOutputSamplesToExpectedOutput({
      steps: [step],
      declaredOutputSchemaByLogicFunctionId: new Map([
        ['function-id', declaredOutputSchema],
      ]),
    });

    expect(movedStepIds).toEqual([]);
  });
});
