import { getOutputSchemaFromValue } from 'twenty-shared/logic-function';
import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';

import { moveStepOutputSamplesToExpectedOutput } from 'src/database/commands/upgrade-version-command/2-57/utils/move-step-output-samples-to-expected-output.util';

const buildStep = (type: string, settings: Record<string, unknown>) => ({
  id: `${type}-step`,
  type,
  settings: { input: {}, ...settings },
});

const moveSamples = (
  steps: ReturnType<typeof buildStep>[],
  declaredOutputSchemaByLogicFunctionId = new Map<string, BaseOutputSchemaV2>(),
) =>
  moveStepOutputSamplesToExpectedOutput({
    steps,
    declaredOutputSchemaByLogicFunctionId,
  });

describe('moveStepOutputSamplesToExpectedOutput', () => {
  it.each([
    { description: 'an object', testResult: { total: 3, tags: ['a'] } },
    { description: 'an array', testResult: [{ id: 1 }, { id: 2 }] },
  ])('moves a test result that is $description into expectedOutputSchema', ({
    testResult,
  }) => {
    const step = buildStep('CODE', {
      outputSchema: getOutputSchemaFromValue(testResult),
      expectedOutputSchema: { typed: 'by hand' },
    });

    expect(moveSamples([step])).toEqual({
      steps: [
        {
          ...step,
          settings: { ...step.settings, expectedOutputSchema: testResult },
        },
      ],
      movedStepIds: ['CODE-step'],
    });
  });

  it('leaves steps whose schema is not a test result', () => {
    const declaredOutputSchema: BaseOutputSchemaV2 = {
      result: { isLeaf: true, type: 'string', label: 'result', value: '' },
    };
    const steps = [
      buildStep('HTTP_REQUEST', {
        outputSchema: getOutputSchemaFromValue({ status: 200 }),
        expectedOutputSchema: { status: 200 },
      }),
      buildStep('CODE', {
        outputSchema: {
          link: { isLeaf: true, tab: 'test', label: 'Generate Function Output' },
          _outputSchemaType: 'LINK',
        },
        expectedOutputSchema: { result: 42 },
      }),
      buildStep('LOGIC_FUNCTION', {
        input: { logicFunctionId: 'function-id' },
        outputSchema: declaredOutputSchema,
      }),
    ];

    expect(
      moveSamples(steps, new Map([['function-id', declaredOutputSchema]])),
    ).toEqual({ steps, movedStepIds: [] });
  });
});
