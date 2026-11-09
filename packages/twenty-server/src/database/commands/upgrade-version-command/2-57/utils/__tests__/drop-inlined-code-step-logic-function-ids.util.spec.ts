import { UNRECOVERABLE_CODE_STEP_SOURCE } from 'src/database/commands/upgrade-version-command/2-56/utils/inline-code-step-sources.util';
import { type StoredWorkflowStep } from 'src/database/commands/upgrade-version-command/2-56/utils/step-agent-inline-config.type';
import { dropInlinedCodeStepLogicFunctionIds } from 'src/database/commands/upgrade-version-command/2-57/utils/drop-inlined-code-step-logic-function-ids.util';

const SOURCE = 'export const main = async () => ({ done: true });';

const buildStep = ({
  input,
  type = 'CODE',
  id = 'step-id',
}: {
  input: Record<string, unknown>;
  type?: string;
  id?: string;
}): StoredWorkflowStep => ({
  id,
  type,
  name: 'Compute',
  settings: { input, outputSchema: {} },
});

const drop = (
  steps: StoredWorkflowStep[],
  retainedLogicFunctionIds: ReadonlySet<string> = new Set(),
) =>
  dropInlinedCodeStepLogicFunctionIds({
    steps,
    existingLogicFunctionIds: new Set(['logic-function-id']),
    retainedLogicFunctionIds,
  });

const NO_REFERENCES = {
  droppedReferences: [],
  stubbedReferences: [],
  codelessReferences: [],
};

describe('dropInlinedCodeStepLogicFunctionIds', () => {
  it('drops the logic function of a code step that has its code', () => {
    expect(
      drop([
        buildStep({
          input: {
            code: SOURCE,
            logicFunctionId: 'logic-function-id',
            logicFunctionInput: { a: '{{trigger.a}}' },
          },
        }),
      ]),
    ).toEqual({
      ...NO_REFERENCES,
      steps: [
        buildStep({
          input: { code: SOURCE, logicFunctionInput: { a: '{{trigger.a}}' } },
        }),
      ],
      droppedReferences: [
        { stepId: 'step-id', logicFunctionId: 'logic-function-id' },
      ],
    });
  });

  it('keeps the logic function of a code step with code when the function is retained', () => {
    const step = buildStep({
      input: { code: SOURCE, logicFunctionId: 'logic-function-id' },
    });

    expect(drop([step], new Set(['logic-function-id']))).toEqual({
      ...NO_REFERENCES,
      steps: [step],
    });
  });

  it.each([
    ['no code', {}],
    ['an empty code', { code: '' }],
  ])(
    'keeps the existing logic function of a code step with %s',
    (_description, codeInput) => {
      const step = buildStep({
        input: { ...codeInput, logicFunctionId: 'logic-function-id' },
      });

      expect(drop([step])).toEqual({
        ...NO_REFERENCES,
        steps: [step],
        codelessReferences: [
          { stepId: 'step-id', logicFunctionId: 'logic-function-id' },
        ],
      });
    },
  );

  it('writes code that throws into a code step without code whose function is gone', () => {
    expect(
      drop([buildStep({ input: { logicFunctionId: 'deleted-function-id' } })]),
    ).toEqual({
      ...NO_REFERENCES,
      steps: [buildStep({ input: { code: UNRECOVERABLE_CODE_STEP_SOURCE } })],
      stubbedReferences: [
        { stepId: 'step-id', logicFunctionId: 'deleted-function-id' },
      ],
    });
  });

  it('leaves other steps and code steps without a logic function alone', () => {
    const steps = [
      buildStep({
        id: 'tool-step-id',
        type: 'LOGIC_FUNCTION',
        input: { code: SOURCE, logicFunctionId: 'logic-function-id' },
      }),
      buildStep({ id: 'inline-step-id', input: { code: SOURCE } }),
      { id: 'no-settings-step-id', type: 'CODE' },
    ];

    expect(drop(steps)).toEqual({ ...NO_REFERENCES, steps });
  });
});
