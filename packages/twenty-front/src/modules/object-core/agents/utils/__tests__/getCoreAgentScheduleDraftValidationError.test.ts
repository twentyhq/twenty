import { CORE_AGENT_STORY_AGENT } from '@/object-core/agents/components/__stories__/coreAgentStoryAgent';
import { getCoreAgentScheduleDraftFromPattern } from '@/object-core/agents/utils/getCoreAgentScheduleDraftFromPattern';
import { getCoreAgentScheduleDraftValidationError } from '@/object-core/agents/utils/getCoreAgentScheduleDraftValidationError';
import { reconcileCoreAgentEditSession } from '@/object-core/agents/utils/reconcileCoreAgentEditSession';

it('blocks Save for invalid numeric buffers while ignoring removed or unsupported triggers', () => {
  const trigger = {
    id: '0d2b1a8c-77a4-4e2e-8f0c-3a8e9f6b4c22',
    type: 'CRON',
    isActive: false,
    instructions: null,
    settings: { pattern: '0 9 */1 * *' },
  };
  const session = reconcileCoreAgentEditSession({
    session: undefined,
    agent: { ...CORE_AGENT_STORY_AGENT, triggers: [trigger] },
    hasRoleChanges: false,
  });
  const scheduleDrafts = {
    [trigger.id]: {
      ...getCoreAgentScheduleDraftFromPattern(trigger.settings.pattern),
      hour: '24',
    },
  };
  expect(
    getCoreAgentScheduleDraftValidationError({ ...session, scheduleDrafts }),
  ).not.toBeNull();
  expect(
    getCoreAgentScheduleDraftValidationError({
      ...session,
      scheduleDrafts,
      draft: { ...session.draft, triggers: [] },
    }),
  ).toBeNull();
  expect(
    getCoreAgentScheduleDraftValidationError({
      ...session,
      scheduleDrafts,
      draft: {
        ...session.draft,
        triggers: [{ id: trigger.id, type: 'WEBHOOK' }],
      },
    }),
  ).toBeNull();
});
