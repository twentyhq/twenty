import { AutomatedTriggerType } from 'src/engine/core-modules/workflow/enums/automated-trigger-type.enum';
import { computeAutomatedTriggerFromWorkflowVersion } from 'src/engine/core-modules/workflow/utils/compute-automated-trigger-from-workflow-version.util';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const buildWorkflowVersion = (trigger: WorkflowTrigger | null) => ({
  id: 'core-version-1',
  workflowId: 'workspace-workflow-1',
  coreWorkflowId: 'core-workflow-1',
  applicationId: 'application-1',
  triggers: trigger ? [trigger] : [],
});

describe('computeAutomatedTriggerFromWorkflowVersion', () => {
  it('should build a database event trigger from the core version', () => {
    const workflowVersion = buildWorkflowVersion({
      type: WorkflowTriggerType.DATABASE_EVENT,
      name: 'Record created',
      settings: { eventName: 'company.created', outputSchema: {} },
    });

    expect(
      computeAutomatedTriggerFromWorkflowVersion({ workflowVersion }),
    ).toEqual({
      workflowId: 'core-workflow-1',
      applicationId: 'application-1',
      coreWorkflowVersionId: 'core-version-1',
      type: AutomatedTriggerType.DATABASE_EVENT,
      settings: { eventName: 'company.created', outputSchema: {} },
    });
  });

  it('should return null for manual triggers', () => {
    const workflowVersion = buildWorkflowVersion({
      type: WorkflowTriggerType.MANUAL,
      name: 'Manual trigger',
      settings: { outputSchema: {} },
    });

    expect(
      computeAutomatedTriggerFromWorkflowVersion({ workflowVersion }),
    ).toBeNull();
  });
});
