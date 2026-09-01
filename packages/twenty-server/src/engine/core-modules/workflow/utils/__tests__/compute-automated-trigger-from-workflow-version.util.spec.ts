import { type WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { computeAutomatedTriggerFromWorkflowVersion } from 'src/engine/core-modules/workflow/utils/compute-automated-trigger-from-workflow-version.util';
import { AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const buildWorkflowVersion = (trigger: object | null) =>
  ({
    id: 'core-version-1',
    workflowId: 'workspace-workflow-1',
    triggers: trigger ? [trigger] : [],
  }) as unknown as WorkflowVersionEntity;

describe('computeAutomatedTriggerFromWorkflowVersion', () => {
  it('should build a database event trigger carrying both version ids', () => {
    const workflowVersion = buildWorkflowVersion({
      type: WorkflowTriggerType.DATABASE_EVENT,
      settings: { eventName: 'company.created' },
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
      settings: { eventName: 'company.created' },
    });
  });

  it('should keep a null workspace version id when the twin is missing', () => {
    const workflowVersion = buildWorkflowVersion({
      type: WorkflowTriggerType.DATABASE_EVENT,
      settings: { eventName: 'company.created' },
    });

    const automatedTrigger = computeAutomatedTriggerFromWorkflowVersion({
      workflowVersion,
      workspaceWorkflowVersionId: null,
    });

    expect(automatedTrigger?.workspaceWorkflowVersionId).toBeNull();
    expect(automatedTrigger?.coreWorkflowVersionId).toBe('core-version-1');
  });

  it('should return null for manual triggers', () => {
    const workflowVersion = buildWorkflowVersion({
      type: WorkflowTriggerType.MANUAL,
      settings: {},
    });

    expect(
      computeAutomatedTriggerFromWorkflowVersion({
        workflowVersion,
        workspaceWorkflowVersionId: 'workspace-version-1',
      }),
    ).toBeNull();
  });
});
