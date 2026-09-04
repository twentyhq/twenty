import { computeAutomatedTriggerFromWorkflowVersion } from 'src/engine/core-modules/workflow/utils/compute-automated-trigger-from-workflow-version.util';
import { AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const buildWorkflowVersion = (trigger: WorkflowTrigger | null) => ({
  id: 'core-version-1',
  workflowId: 'workspace-workflow-1',
  triggers: trigger ? [trigger] : [],
});

describe('computeAutomatedTriggerFromWorkflowVersion', () => {
  it('should build a database event trigger carrying both version ids', () => {
    const workflowVersion = buildWorkflowVersion({
      type: WorkflowTriggerType.DATABASE_EVENT,
      name: 'Record created',
      settings: { eventName: 'company.created', outputSchema: {} },
    });

    expect(
      computeAutomatedTriggerFromWorkflowVersion({
        workflowVersion,
        workspaceWorkflowVersionId: 'workspace-version-1',
      }),
    ).toEqual({
      workflowId: 'workspace-workflow-1',
      coreWorkflowVersionId: 'core-version-1',
      workspaceWorkflowVersionId: 'workspace-version-1',
      type: AutomatedTriggerType.DATABASE_EVENT,
      settings: { eventName: 'company.created', outputSchema: {} },
    });
  });

  it('should collapse both ids to the legacy shape when the twin is missing', () => {
    const workflowVersion = buildWorkflowVersion({
      type: WorkflowTriggerType.DATABASE_EVENT,
      name: 'Record created',
      settings: { eventName: 'company.created', outputSchema: {} },
    });

    const automatedTrigger = computeAutomatedTriggerFromWorkflowVersion({
      workflowVersion,
      workspaceWorkflowVersionId: null,
    });

    expect(automatedTrigger?.workspaceWorkflowVersionId).toBeNull();
    expect(automatedTrigger?.coreWorkflowVersionId).toBeNull();
  });

  it('should return null for manual triggers', () => {
    const workflowVersion = buildWorkflowVersion({
      type: WorkflowTriggerType.MANUAL,
      name: 'Manual trigger',
      settings: { outputSchema: {} },
    });

    expect(
      computeAutomatedTriggerFromWorkflowVersion({
        workflowVersion,
        workspaceWorkflowVersionId: 'workspace-version-1',
      }),
    ).toBeNull();
  });
});
