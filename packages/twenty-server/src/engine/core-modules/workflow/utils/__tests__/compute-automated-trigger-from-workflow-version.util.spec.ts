import { type WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { computeAutomatedTriggerFromWorkflowVersion } from 'src/engine/core-modules/workflow/utils/compute-automated-trigger-from-workflow-version.util';
import { AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const WORKSPACE_LINKS = {
  coreWorkflowId: 'core-workflow-1',
  workspaceWorkflowVersionId: 'workspace-version-1',
};

const buildWorkflowVersion = (trigger: object | null) =>
  ({
    id: 'core-version-1',
    workflowId: 'workspace-workflow-1',
    triggers: trigger ? [trigger] : [],
  }) as unknown as WorkflowVersionEntity;

describe('computeAutomatedTriggerFromWorkflowVersion', () => {
  it('should build a database event trigger carrying both id pairs', () => {
    const workflowVersion = buildWorkflowVersion({
      type: WorkflowTriggerType.DATABASE_EVENT,
      settings: { eventName: 'company.created' },
    });

    expect(
      computeAutomatedTriggerFromWorkflowVersion(
        workflowVersion,
        WORKSPACE_LINKS,
      ),
    ).toEqual({
      workflowId: 'workspace-workflow-1',
      coreWorkflowId: 'core-workflow-1',
      coreWorkflowVersionId: 'core-version-1',
      workspaceWorkflowVersionId: 'workspace-version-1',
      type: AutomatedTriggerType.DATABASE_EVENT,
      settings: { eventName: 'company.created' },
    });
  });

  it('should keep null links when the workspace twins are missing', () => {
    const workflowVersion = buildWorkflowVersion({
      type: WorkflowTriggerType.DATABASE_EVENT,
      settings: { eventName: 'company.created' },
    });

    const automatedTrigger = computeAutomatedTriggerFromWorkflowVersion(
      workflowVersion,
      { coreWorkflowId: null, workspaceWorkflowVersionId: null },
    );

    expect(automatedTrigger?.coreWorkflowId).toBeNull();
    expect(automatedTrigger?.workspaceWorkflowVersionId).toBeNull();
    expect(automatedTrigger?.coreWorkflowVersionId).toBe('core-version-1');
  });

  it('should return null for manual triggers', () => {
    const workflowVersion = buildWorkflowVersion({
      type: WorkflowTriggerType.MANUAL,
      settings: {},
    });

    expect(
      computeAutomatedTriggerFromWorkflowVersion(
        workflowVersion,
        WORKSPACE_LINKS,
      ),
    ).toBeNull();
  });
});
