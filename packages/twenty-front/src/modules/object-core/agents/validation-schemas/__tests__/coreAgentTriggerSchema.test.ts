import { coreAgentTriggerSchema } from '@/object-core/agents/validation-schemas/coreAgentTriggerSchema';

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

describe('coreAgentTriggerSchema', () => {
  it('accepts valid cron and database event triggers', () => {
    expect(coreAgentTriggerSchema.safeParse(CRON_TRIGGER).success).toBe(true);
    expect(
      coreAgentTriggerSchema.safeParse(DATABASE_EVENT_TRIGGER).success,
    ).toBe(true);
  });

  it('rejects a cron pattern that is still being typed', () => {
    expect(
      coreAgentTriggerSchema.safeParse({
        ...CRON_TRIGGER,
        settings: { pattern: '0 9 *' },
      }).success,
    ).toBe(false);
  });

  it('rejects an event name without an action', () => {
    expect(
      coreAgentTriggerSchema.safeParse({
        ...DATABASE_EVENT_TRIGGER,
        settings: { eventName: 'company' },
      }).success,
    ).toBe(false);
  });

  it('rejects instructions longer than the server accepts', () => {
    expect(
      coreAgentTriggerSchema.safeParse({
        ...CRON_TRIGGER,
        instructions: 'a'.repeat(10_001),
      }).success,
    ).toBe(false);
  });

  it('rejects watched fields outside of an updated event or with empty names', () => {
    expect(
      coreAgentTriggerSchema.safeParse({
        ...DATABASE_EVENT_TRIGGER,
        settings: { eventName: 'company.created', updatedFields: ['name'] },
      }).success,
    ).toBe(false);
    expect(
      coreAgentTriggerSchema.safeParse({
        ...DATABASE_EVENT_TRIGGER,
        settings: { eventName: 'company.updated', updatedFields: [''] },
      }).success,
    ).toBe(false);
    expect(
      coreAgentTriggerSchema.safeParse({
        ...DATABASE_EVENT_TRIGGER,
        settings: { eventName: 'company.updated', updatedFields: ['name'] },
      }).success,
    ).toBe(true);
  });
});
