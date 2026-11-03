import { inlineCodeStepSources } from 'src/database/commands/upgrade-version-command/2-56/utils/inline-code-step-sources.util';
import { type StoredWorkflowStep } from 'src/database/commands/upgrade-version-command/2-56/utils/step-agent-inline-config.type';

const SOURCE = 'export const main = async () => ({ done: true });';

const buildStep = (
  input: Record<string, unknown>,
  type = 'CODE',
): StoredWorkflowStep => ({
  id: 'step-id',
  type,
  name: 'Compute',
  settings: { input, outputSchema: {} },
});

const inline = (steps: StoredWorkflowStep[]) =>
  inlineCodeStepSources({
    steps,
    sourceByLogicFunctionId: new Map([['logic-function-id', SOURCE]]),
  });

describe('inlineCodeStepSources', () => {
  it('replaces the logic function of a legacy code step with its source', () => {
    expect(
      inline([
        buildStep({
          logicFunctionId: 'logic-function-id',
          logicFunctionInput: { a: '{{trigger.a}}' },
        }),
      ]),
    ).toEqual({
      steps: [
        buildStep({ logicFunctionInput: { a: '{{trigger.a}}' }, code: SOURCE }),
      ],
      hasChanged: true,
    });
  });

  it('leaves a step whose function source is unknown', () => {
    const step = buildStep({
      logicFunctionId: 'unknown-logic-function-id',
      logicFunctionInput: {},
    });

    expect(inline([step])).toEqual({ steps: [step], hasChanged: false });
  });

  it('leaves code steps that already carry their code and logic function steps', () => {
    const steps = [
      buildStep({
        code: 'export const main = async () => ({});',
        logicFunctionId: 'logic-function-id',
        logicFunctionInput: {},
      }),
      buildStep(
        { logicFunctionId: 'logic-function-id', logicFunctionInput: {} },
        'LOGIC_FUNCTION',
      ),
    ];

    expect(inline(steps)).toEqual({ steps, hasChanged: false });
  });
});
