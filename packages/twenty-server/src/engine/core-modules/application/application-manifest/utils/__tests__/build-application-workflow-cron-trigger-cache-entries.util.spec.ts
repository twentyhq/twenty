import { buildApplicationWorkflowCronTriggerCacheEntries } from 'src/engine/core-modules/application/application-manifest/utils/build-application-workflow-cron-trigger-cache-entries.util';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const applicationWorkflow = (id: string, trigger: WorkflowTrigger) => ({
  id,
  flatUniversalWorkflowVersion: {
    id: `${id.slice(0, -1)}9`,
    triggers: [trigger],
  },
});

describe('buildApplicationWorkflowCronTriggerCacheEntries', () => {
  it('publishes only the scheduled workflows with their cron pattern', () => {
    const entries = buildApplicationWorkflowCronTriggerCacheEntries({
      workspaceId: WORKSPACE_ID,
      workflows: [
        applicationWorkflow('11111111-1111-4111-8111-111111111111', {
          name: 'On a schedule',
          type: WorkflowTriggerType.CRON,
          settings: {
            type: 'HOURS',
            schedule: { hour: 2, minute: 30 },
            outputSchema: {},
          },
        }),
        applicationWorkflow('22222222-2222-4222-8222-222222222222', {
          name: 'Manual trigger',
          type: WorkflowTriggerType.MANUAL,
          settings: { outputSchema: {} },
        }),
      ],
    });

    expect(entries).toEqual([
      {
        workspaceId: WORKSPACE_ID,
        workflowId: '11111111-1111-4111-8111-111111111111',
        coreWorkflowVersionId: '11111111-1111-4111-8111-111111111119',
        pattern: '30 */2 * * *',
      },
    ]);
  });
});
