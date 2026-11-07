import {
  type WorkflowAction,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { getRunFlowWithVersionOutputSchemas } from '@/workflow/utils/getRunFlowWithVersionOutputSchemas';

const buildStep = ({
  id,
  outputSchema,
}: {
  id: string;
  outputSchema: WorkflowAction['settings']['outputSchema'];
}): WorkflowAction => ({
  id,
  name: id,
  type: 'CREATE_RECORD',
  valid: true,
  settings: {
    input: { objectName: 'person', objectRecord: {} },
    outputSchema,
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
});

const buildTrigger = (
  outputSchema: WorkflowTrigger['settings']['outputSchema'],
): WorkflowTrigger => ({
  name: 'Launch manually',
  type: 'MANUAL',
  settings: { outputSchema, availability: { type: 'GLOBAL' } },
});

const versionOutputSchema = {
  name: { isLeaf: true, type: 'TEXT', label: 'Name', value: '' },
};

describe('getRunFlowWithVersionOutputSchemas', () => {
  it("gives a run stored without schemas its version's computed ones", () => {
    const runFlow = {
      trigger: buildTrigger({}),
      steps: [
        buildStep({ id: 'create-person', outputSchema: {} }),
        buildStep({ id: 'removed-from-version', outputSchema: {} }),
      ],
    };

    const { trigger, steps } = getRunFlowWithVersionOutputSchemas({
      runFlow,
      version: {
        trigger: buildTrigger(versionOutputSchema),
        steps: [
          buildStep({ id: 'create-person', outputSchema: versionOutputSchema }),
        ],
      },
    });

    expect(trigger.settings.outputSchema).toEqual(versionOutputSchema);
    expect(steps.map((step) => step.settings.outputSchema)).toEqual([
      versionOutputSchema,
      {},
    ]);
  });
});
