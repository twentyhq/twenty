import { buildCronTriggerCacheEntry } from 'src/engine/core-modules/workflow/utils/build-cron-trigger-cache-entry.util';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const CRON_TRIGGER = {
  name: 'Every minute',
  type: WorkflowTriggerType.CRON,
  settings: { type: 'CUSTOM', pattern: '* * * * *', outputSchema: {} },
} as WorkflowTrigger;

const coreWorkflowVersion = { id: 'core-version-1', workspaceId: 'workspace-1' };

describe('buildCronTriggerCacheEntry', () => {
  it('should keep the legacy workflow id so the cron lock key does not change', () => {
    expect(
      buildCronTriggerCacheEntry({
        trigger: CRON_TRIGGER,
        coreWorkflow: { id: 'core-workflow-1', workspaceWorkflowId: 'legacy-1' },
        coreWorkflowVersion,
      }),
    ).toEqual({
      workspaceId: 'workspace-1',
      workflowId: 'core-workflow-1',
      legacyWorkflowId: 'legacy-1',
      pattern: '* * * * *',
      coreWorkflowVersionId: 'core-version-1',
    });
  });

  it('should omit the legacy workflow id for a workflow created in core', () => {
    expect(
      buildCronTriggerCacheEntry({
        trigger: CRON_TRIGGER,
        coreWorkflow: { id: 'core-workflow-1', workspaceWorkflowId: null },
        coreWorkflowVersion,
      }),
    ).not.toHaveProperty('legacyWorkflowId');
  });

  it('should return null for a non-cron trigger', () => {
    expect(
      buildCronTriggerCacheEntry({
        trigger: {
          name: 'Manual',
          type: WorkflowTriggerType.MANUAL,
          settings: { outputSchema: {} },
        } as WorkflowTrigger,
        coreWorkflow: { id: 'core-workflow-1', workspaceWorkflowId: null },
        coreWorkflowVersion,
      }),
    ).toBeNull();
  });
});
