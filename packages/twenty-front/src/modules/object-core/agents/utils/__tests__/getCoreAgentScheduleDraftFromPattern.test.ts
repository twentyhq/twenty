import { isDefined } from 'twenty-shared/utils';
import { getCoreAgentScheduleDraftFromPattern } from '@/object-core/agents/utils/getCoreAgentScheduleDraftFromPattern';
import { getCronScheduleDraftResult } from '@/workflow/workflow-trigger/utils/getCronScheduleDraftResult';
import { convertScheduleToCronExpression } from '@/workflow/workflow-trigger/utils/convertScheduleToCronExpression';

it('reopens canonical interval patterns in their matching controls without changing cron semantics', () => {
  for (const [pattern, interval] of [
    ['*/15 * * * *', 'MINUTES'],
    ['30 */2 * * *', 'HOURS'],
    ['0 9 */1 * *', 'DAYS'],
    ['0 9 * * 1', 'CUSTOM'],
    ['0 9 * * MON-FRI', 'CUSTOM'],
  ] as const) {
    const draft = getCoreAgentScheduleDraftFromPattern(pattern);
    const result = getCronScheduleDraftResult(draft);
    expect(draft.interval).toBe(interval);
    expect(result.settings).toBeDefined();
    if (!isDefined(result.settings)) {
      throw new Error('Expected valid schedule settings');
    }
    expect(convertScheduleToCronExpression({ settings: result.settings })).toBe(
      pattern,
    );
  }
});
