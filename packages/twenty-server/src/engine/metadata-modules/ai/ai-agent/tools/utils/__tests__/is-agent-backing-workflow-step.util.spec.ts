import { WorkflowActionType } from 'twenty-shared/workflow';

import { isAgentBackingWorkflowStep } from 'src/engine/metadata-modules/ai/ai-agent/tools/utils/is-agent-backing-workflow-step.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const agentId = '20202020-0000-4000-8000-000000000001';

const buildStep = ({
  type,
  agentId,
}: {
  type: WorkflowActionType;
  agentId: string;
}) => ({ type, settings: { input: { agentId } } }) as WorkflowAction;

describe('isAgentBackingWorkflowStep', () => {
  it('returns true when an AI agent step references the agent', () => {
    expect(
      isAgentBackingWorkflowStep({
        agentId,
        flatWorkflowVersions: [
          { steps: null },
          {
            steps: [buildStep({ type: WorkflowActionType.AI_AGENT, agentId })],
          },
        ],
      }),
    ).toBe(true);
  });

  it('returns false when only another agent or another step type matches', () => {
    expect(
      isAgentBackingWorkflowStep({
        agentId,
        flatWorkflowVersions: [
          {
            steps: [
              buildStep({
                type: WorkflowActionType.AI_AGENT,
                agentId: 'other-agent-id',
              }),
              buildStep({ type: WorkflowActionType.CODE, agentId }),
            ],
          },
        ],
      }),
    ).toBe(false);
  });

  it('returns false without workflow versions', () => {
    expect(
      isAgentBackingWorkflowStep({ agentId, flatWorkflowVersions: [] }),
    ).toBe(false);
  });
});
