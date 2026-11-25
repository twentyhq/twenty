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
    existingLogicFunctionIds: new Set([
      'logic-function-id',
      'unreadable-logic-function-id',
    ]),
  });

describe('inlineCodeStepSources', () => {
  it('writes the source of a legacy code step and keeps its logic function', () => {
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
          input: {
            logicFunctionId: 'logic-function-id',
            logicFunctionInput: { a: '{{trigger.a}}' },
            code: SOURCE,
          },
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
    ).toEqual([
      buildStep({
        input: {
          code: SOURCE,
          logicFunctionId: 'logic-function-id',
          logicFunctionInput: {},
        },
      }),
    ]);
  });

  it('writes code that throws for a step whose function is gone', () => {
    expect(
      inline([
        buildStep({
          input: {
            logicFunctionId: 'deleted-logic-function-id',
            logicFunctionInput: {},
          },
        }),
      ]),
    ).toEqual({
      steps: [
        buildStep({
          input: {
            logicFunctionId: 'deleted-logic-function-id',
            logicFunctionInput: {},
            code: UNRECOVERABLE_CODE_STEP_SOURCE,
          },
        }),
      ],
      inlinedCodeSteps: [
        { stepId: 'step-id', logicFunctionId: 'deleted-logic-function-id' },
      ],
    });
  });

  it('leaves steps whose function exists without a usable source, code steps that already carry their code and logic function steps', () => {
    const steps = [
      buildStep({
        input: {
          logicFunctionId: 'unreadable-logic-function-id',
          logicFunctionInput: {},
        },
      }),
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
