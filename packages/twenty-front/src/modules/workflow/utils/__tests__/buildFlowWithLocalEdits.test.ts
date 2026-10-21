import {
  type WorkflowCodeAction,
  type WorkflowManualTrigger,
} from '@/workflow/types/Workflow';
import { buildFlowWithLocalEdits } from '@/workflow/utils/buildFlowWithLocalEdits';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

const buildStep = ({
  id,
  name,
}: {
  id: string;
  name: string;
}): WorkflowCodeAction => ({
  id,
  name,
  valid: true,
  type: 'CODE',
  settings: {
    input: { logicFunctionId: 'logic-function-id', logicFunctionInput: {} },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
});

const localFlow = {
  workflowVersionId: 'active-version',
  trigger: null,
  steps: [
    buildStep({ id: 'a', name: 'local a' }),
    buildStep({ id: 'b', name: 'local b' }),
  ],
};

const serverFlow = {
  workflowVersionId: 'draft-version',
  trigger: null,
  steps: [
    buildStep({ id: 'a', name: 'server a' }),
    buildStep({ id: 'b', name: 'server b' }),
  ],
};

describe('buildFlowWithLocalEdits', () => {
  it('keeps the local value of steps with pending edits', () => {
    expect(
      buildFlowWithLocalEdits({ serverFlow, localFlow, localFlowKeys: ['a'] }),
    ).toEqual({
      workflowVersionId: 'draft-version',
      trigger: null,
      steps: [
        buildStep({ id: 'a', name: 'local a' }),
        buildStep({ id: 'b', name: 'server b' }),
      ],
    });
  });

  it('returns the server flow when nothing is edited locally', () => {
    expect(
      buildFlowWithLocalEdits({ serverFlow, localFlow, localFlowKeys: [] }),
    ).toBe(serverFlow);
  });

  it('keeps the local trigger when it has pending edits', () => {
    const localTrigger: WorkflowManualTrigger = {
      name: 'local trigger',
      type: 'MANUAL',
      settings: { outputSchema: {} },
    };

    expect(
      buildFlowWithLocalEdits({
        serverFlow,
        localFlow: { ...localFlow, trigger: localTrigger },
        localFlowKeys: [TRIGGER_STEP_ID],
      }).trigger,
    ).toBe(localTrigger);
  });
});
