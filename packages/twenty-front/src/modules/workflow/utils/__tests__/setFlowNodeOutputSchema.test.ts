import {
  type WorkflowAction,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { setFlowNodeOutputSchema } from '@/workflow/utils/setFlowNodeOutputSchema';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

const buildStep = (id: string): WorkflowAction => ({
  id,
  name: id,
  type: 'CREATE_RECORD',
  valid: true,
  settings: {
    input: { objectName: 'person', objectRecord: {} },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
});

const trigger: WorkflowTrigger = {
  name: 'Launch manually',
  type: 'MANUAL',
  settings: { outputSchema: {}, availability: { type: 'GLOBAL' } },
};

const serverOutputSchema = {
  name: { isLeaf: true, type: 'TEXT', label: 'Name', value: '' },
};

describe('setFlowNodeOutputSchema', () => {
  it('sets the schema on the step it is for and leaves the others as they are', () => {
    const flow = {
      workflowVersionId: 'version-id',
      trigger,
      steps: [buildStep('create-person'), buildStep('other-step')],
    };

    const updatedFlow = setFlowNodeOutputSchema({
      flow,
      flowKey: 'create-person',
      outputSchema: serverOutputSchema,
    });

    expect(
      updatedFlow.steps?.map((step) => step.settings.outputSchema),
    ).toEqual([serverOutputSchema, {}]);
    expect(updatedFlow.trigger).toBe(trigger);
  });

  it('sets the schema on the trigger', () => {
    const updatedFlow = setFlowNodeOutputSchema({
      flow: { workflowVersionId: 'version-id', trigger, steps: null },
      flowKey: TRIGGER_STEP_ID,
      outputSchema: serverOutputSchema,
    });

    expect(updatedFlow.trigger?.settings.outputSchema).toEqual(
      serverOutputSchema,
    );
  });

  it('does not bring back a trigger removed while the save was in flight', () => {
    const flow = { workflowVersionId: 'version-id', trigger: null, steps: [] };

    expect(
      setFlowNodeOutputSchema({
        flow,
        flowKey: TRIGGER_STEP_ID,
        outputSchema: serverOutputSchema,
      }),
    ).toBe(flow);
  });
});
