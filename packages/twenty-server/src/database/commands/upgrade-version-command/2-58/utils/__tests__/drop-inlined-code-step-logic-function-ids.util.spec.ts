import { UNRECOVERABLE_CODE_STEP_SOURCE } from 'src/database/commands/upgrade-version-command/2-56/utils/inline-code-step-sources.util';
import { type StoredWorkflowStep } from 'src/database/commands/upgrade-version-command/2-56/utils/step-agent-inline-config.type';
import { dropInlinedCodeStepLogicFunctionIds } from 'src/database/commands/upgrade-version-command/2-58/utils/drop-inlined-code-step-logic-function-ids.util';

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

const drop = ({
  steps,
  retainedLogicFunctionIds = new Set(),
}: {
  steps: StoredWorkflowStep[];
  retainedLogicFunctionIds?: ReadonlySet<string>;
}) =>
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
  it.each([
    ['its code', SOURCE],
    ['an empty code, which the executor still runs inline', ''],
  ])(
    'drops the logic function of a code step that has %s',
    (_description, code) => {
      expect(
        drop({
          steps: [
            buildStep({
              input: {
                code,
                logicFunctionId: 'logic-function-id',
                logicFunctionInput: { a: '{{trigger.a}}' },
              },
            }),
          ],
        }),
      ).toEqual({
        ...NO_REFERENCES,
        steps: [
          buildStep({
            input: { code, logicFunctionInput: { a: '{{trigger.a}}' } },
          }),
        ],
        droppedReferences: [
          { stepId: 'step-id', logicFunctionId: 'logic-function-id' },
        ],
      });
    },
  );

  it('keeps the logic function of a code step with code when the function is retained', () => {
    const step = buildStep({
      input: { code: SOURCE, logicFunctionId: 'logic-function-id' },
    });

    expect(
      drop({
        steps: [step],
        retainedLogicFunctionIds: new Set(['logic-function-id']),
      }),
    ).toEqual({ ...NO_REFERENCES, steps: [step] });
  });

  it('keeps the existing logic function of a code step without code', () => {
    const step = buildStep({ input: { logicFunctionId: 'logic-function-id' } });

    expect(drop({ steps: [step] })).toEqual({
      ...NO_REFERENCES,
      steps: [step],
      codelessReferences: [
        { stepId: 'step-id', logicFunctionId: 'logic-function-id' },
      ],
    });
  });

  it('writes code that throws into a code step without code whose function is gone', () => {
    expect(
      drop({
        steps: [buildStep({ input: { logicFunctionId: 'deleted-function-id' } })],
      }),
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

    expect(drop({ steps })).toEqual({ ...NO_REFERENCES, steps });
  });
});
