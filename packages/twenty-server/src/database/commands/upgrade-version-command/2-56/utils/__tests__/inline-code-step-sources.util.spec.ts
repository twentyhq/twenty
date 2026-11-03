import {
  inlineCodeStepSources,
  UNRECOVERABLE_CODE_STEP_SOURCE,
} from 'src/database/commands/upgrade-version-command/2-56/utils/inline-code-step-sources.util';
import { type StoredWorkflowStep } from 'src/database/commands/upgrade-version-command/2-56/utils/step-agent-inline-config.type';

const SOURCE = 'export const main = async () => ({ done: true });';

const buildStep = ({
  input,
  type = 'CODE',
}: {
  input: Record<string, unknown>;
  type?: string;
}): StoredWorkflowStep => ({
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
          input: {
            logicFunctionId: 'logic-function-id',
            logicFunctionInput: { a: '{{trigger.a}}' },
          },
        }),
      ]),
    ).toEqual({
      steps: [
        buildStep({
          input: { logicFunctionInput: { a: '{{trigger.a}}' }, code: SOURCE },
        }),
      ],
      inlinedCodeSteps: [
        { stepId: 'step-id', logicFunctionId: 'logic-function-id' },
      ],
    });
  });

  it('treats an empty code as legacy', () => {
    expect(
      inline([
        buildStep({
          input: {
            code: '',
            logicFunctionId: 'logic-function-id',
            logicFunctionInput: {},
          },
        }),
      ]).steps,
    ).toEqual([buildStep({ input: { code: SOURCE, logicFunctionInput: {} } })]);
  });

  it('replaces a step whose function source is unknown with code that throws', () => {
    expect(
      inline([
        buildStep({
          input: {
            logicFunctionId: 'unknown-logic-function-id',
            logicFunctionInput: {},
          },
        }),
      ]),
    ).toEqual({
      steps: [
        buildStep({
          input: {
            logicFunctionInput: {},
            code: UNRECOVERABLE_CODE_STEP_SOURCE,
          },
        }),
      ],
      inlinedCodeSteps: [
        { stepId: 'step-id', logicFunctionId: 'unknown-logic-function-id' },
      ],
    });
  });

  it('leaves code steps that already carry their code and logic function steps', () => {
    const steps = [
      buildStep({
        input: {
          code: 'export const main = async () => ({});',
          logicFunctionId: 'logic-function-id',
          logicFunctionInput: {},
        },
      }),
      buildStep({
        input: { logicFunctionId: 'logic-function-id', logicFunctionInput: {} },
        type: 'LOGIC_FUNCTION',
      }),
    ];

    expect(inline(steps)).toEqual({ steps, inlinedCodeSteps: [] });
  });
});
