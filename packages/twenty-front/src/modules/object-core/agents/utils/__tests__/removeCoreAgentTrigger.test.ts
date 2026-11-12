import { removeCoreAgentTrigger } from '@/object-core/agents/utils/removeCoreAgentTrigger';

const CRON_TRIGGER = {
  id: '6f1b5a3e-3c3f-4f4a-9a43-0a7f5d6c2b11',
  type: 'CRON' as const,
  isActive: true,
  instructions: null,
  settings: { pattern: '0 9 * * 1' },
};

const DATABASE_EVENT_TRIGGER = {
  id: '0d2b1a8c-77a4-4e2e-8f0c-3a8e9f6b4c22',
  type: 'DATABASE_EVENT' as const,
  isActive: true,
  instructions: 'Qualify the new company',
  settings: { eventName: 'company.created' },
};

const INVALID_TRIGGER = {
  id: CRON_TRIGGER.id,
  type: 'CRON' as const,
  isActive: true,
  instructions: null,
  settings: { pattern: '0 9 *' },
};

describe('removeCoreAgentTrigger', () => {
  it('removes the trigger with the id and keeps the others', () => {
    expect(
      removeCoreAgentTrigger({
        triggers: [CRON_TRIGGER, DATABASE_EVENT_TRIGGER],
        triggerId: CRON_TRIGGER.id,
      }),
    ).toEqual([DATABASE_EVENT_TRIGGER]);
  });

  it('keeps an entry that does not match the trigger schema as is', () => {
    expect(
      removeCoreAgentTrigger({
        triggers: [INVALID_TRIGGER, DATABASE_EVENT_TRIGGER],
        triggerId: CRON_TRIGGER.id,
      }),
    ).toEqual([INVALID_TRIGGER, DATABASE_EVENT_TRIGGER]);
  });

  it('leaves the list unchanged when no trigger has the id', () => {
    expect(
      removeCoreAgentTrigger({
        triggers: [CRON_TRIGGER, DATABASE_EVENT_TRIGGER],
        triggerId: '9b7e2c41-5d6a-4f3b-8e1c-2a4d6f8b0c33',
      }),
    ).toEqual([CRON_TRIGGER, DATABASE_EVENT_TRIGGER]);
  });
});
