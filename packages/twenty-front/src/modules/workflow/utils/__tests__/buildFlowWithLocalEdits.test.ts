import {
  type WorkflowAction,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { buildFlowWithLocalEdits } from '@/workflow/utils/buildFlowWithLocalEdits';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

const buildStep = (id: string, name: string) =>
  ({ id, name, type: 'CODE' }) as WorkflowAction;

const localFlow = {
  workflowVersionId: 'active-version',
  trigger: null,
  steps: [buildStep('a', 'local a'), buildStep('b', 'local b')],
};

const serverFlow = {
  workflowVersionId: 'draft-version',
  trigger: null,
  steps: [buildStep('a', 'server a'), buildStep('b', 'server b')],
};

describe('buildFlowWithLocalEdits', () => {
  it('keeps the local value of steps with unsaved edits', () => {
    expect(
      buildFlowWithLocalEdits({ serverFlow, localFlow, localFlowKeys: ['a'] }),
    ).toEqual({
      workflowVersionId: 'draft-version',
      trigger: null,
      steps: [buildStep('a', 'local a'), buildStep('b', 'server b')],
    });
  });

  it('returns the server flow when nothing is edited locally', () => {
    expect(
      buildFlowWithLocalEdits({ serverFlow, localFlow, localFlowKeys: [] }),
    ).toBe(serverFlow);
  });

  it('keeps the local trigger when it has unsaved edits', () => {
    const localTrigger = { name: 'local trigger' } as WorkflowTrigger;

    expect(
      buildFlowWithLocalEdits({
        serverFlow,
        localFlow: { ...localFlow, trigger: localTrigger },
        localFlowKeys: [TRIGGER_STEP_ID],
      }).trigger,
    ).toBe(localTrigger);
  });
});
