import { getWorkflowCronTriggerFromCoreAgentTrigger } from '@/object-core/agents/utils/getWorkflowCronTriggerFromCoreAgentTrigger';
import { convertScheduleToCronExpression } from '@/workflow/workflow-trigger/utils/convertScheduleToCronExpression';

const buildAgentCronTrigger = (pattern: string) => ({
  id: '6f1b5a3e-3c3f-4f4a-9a43-0a7f5d6c2b11',
  type: 'CRON' as const,
  isActive: true,
  instructions: null,
  settings: { pattern },
});

describe('getWorkflowCronTriggerFromCoreAgentTrigger', () => {
  it.each([
    ['30 9 */2 * *', 'DAYS'],
    ['15 */3 * * *', 'HOURS'],
    ['*/10 * * * *', 'MINUTES'],
    ['0 9 * * 1', 'CUSTOM'],
  ])(
    'opens %s in the %s schedule mode and keeps the same pattern',
    (pattern, type) => {
      const workflowTrigger = getWorkflowCronTriggerFromCoreAgentTrigger(
        buildAgentCronTrigger(pattern),
      );

      expect(workflowTrigger.settings.type).toBe(type);
      expect(convertScheduleToCronExpression(workflowTrigger)).toBe(pattern);
    },
  );
});
