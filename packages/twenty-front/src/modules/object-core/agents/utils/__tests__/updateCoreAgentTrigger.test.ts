import { getCoreAgentTriggerSummary } from '@/object-core/agents/utils/getCoreAgentTriggerSummary';
import { getCoreAgentEditableTrigger } from '@/object-core/agents/utils/getCoreAgentEditableTrigger';
import { updateCoreAgentDatabaseEvent } from '@/object-core/agents/utils/updateCoreAgentDatabaseEvent';
import { updateCoreAgentTrigger } from '@/object-core/agents/utils/updateCoreAgentTrigger';
import { getCoreAgentTriggersValidationError } from '@/object-core/agents/utils/getCoreAgentTriggersValidationError';
import { buildDefaultCoreAgentTrigger } from '@/object-core/agents/utils/buildDefaultCoreAgentTrigger';

const schedule = {
  id: '0d2b1a8c-77a4-4e2e-8f0c-3a8e9f6b4c22',
  type: 'CRON',
  isActive: false,
  instructions: 'Send the weekly report',
  settings: { pattern: '0 9 * * 1', futureOption: { timezone: 'UTC' } },
  futureFlag: true,
};

it('stores invalid visible schedule text without losing pause, instructions, extra fields, or opaque rows', () => {
  const opaqueTrigger = { type: 'WEBHOOK', secret: { key: 'preserve' } };
  const triggers = updateCoreAgentTrigger({
    triggers: [opaqueTrigger, schedule],
    triggerId: schedule.id,
    update: (trigger) =>
      trigger.type === 'CRON'
        ? { ...trigger, settings: { pattern: '0 9 *' } }
        : trigger,
  });

  expect(triggers[0]).toBe(opaqueTrigger);
  expect(triggers[1]).toEqual({
    ...schedule,
    settings: { ...schedule.settings, pattern: '0 9 *' },
  });
  expect(getCoreAgentEditableTrigger(triggers[1])).toMatchObject({
    settings: { pattern: '0 9 *' },
  });
  expect(getCoreAgentTriggersValidationError(triggers)).not.toBeNull();
  expect(
    getCoreAgentTriggersValidationError([opaqueTrigger, schedule]),
  ).toBeNull();
});

it('keeps watched fields for the same event and clears them for another record or event', () => {
  const trigger = buildDefaultCoreAgentTrigger({
    type: 'DATABASE_EVENT',
    objectNameSingular: 'company',
  });

  if (trigger.type !== 'DATABASE_EVENT') {
    throw new Error('Expected a record trigger');
  }

  const watchedTrigger = {
    ...trigger,
    settings: {
      eventName: 'company.updated',
      updatedFields: ['name'],
      batchMode: true,
    },
  };
  expect(
    updateCoreAgentDatabaseEvent({
      trigger: watchedTrigger,
      objectNameSingular: 'company',
      action: 'updated',
    }).settings,
  ).toEqual(watchedTrigger.settings);
  expect(
    updateCoreAgentDatabaseEvent({
      trigger: watchedTrigger,
      objectNameSingular: 'person',
      action: 'updated',
    }).settings,
  ).toEqual({
    eventName: 'person.updated',
    updatedFields: undefined,
    batchMode: true,
  });
  expect(
    updateCoreAgentDatabaseEvent({
      trigger: watchedTrigger,
      objectNameSingular: 'company',
      action: 'created',
    }).settings.updatedFields,
  ).toBeUndefined();
});

it('keeps the weekly Monday at 09:00 default and counts opaque rows toward the limit', () => {
  expect(
    buildDefaultCoreAgentTrigger({
      type: 'CRON',
      objectNameSingular: 'company',
    }),
  ).toMatchObject({
    settings: { pattern: '0 9 * * 1' },
    isActive: true,
    instructions: null,
  });
  expect(
    getCoreAgentTriggersValidationError(Array(21).fill(null)),
  ).not.toBeNull();
});

it('clears watched fields in the saved JSON shape while retaining empty and null extension values', () => {
  const trigger = {
    id: schedule.id,
    type: 'DATABASE_EVENT',
    isActive: true,
    instructions: null,
    settings: {
      eventName: 'company.updated',
      updatedFields: ['name'],
      futureEmpty: {},
      futureNull: null,
    },
  };
  const updated = updateCoreAgentTrigger({
    triggers: [trigger],
    triggerId: trigger.id,
    update: (current) =>
      current.type === 'DATABASE_EVENT'
        ? updateCoreAgentDatabaseEvent({
            trigger: current,
            objectNameSingular: 'person',
            action: 'updated',
          })
        : current,
  });

  expect(updated).toEqual([
    {
      ...trigger,
      settings: {
        eventName: 'person.updated',
        futureEmpty: {},
        futureNull: null,
      },
    },
  ]);
  expect(updated).toEqual(JSON.parse(JSON.stringify(updated)));
});

it('shows watched field labels and preserves missing field names as a fallback', () => {
  expect(
    getCoreAgentTriggerSummary({
      trigger: {
        id: schedule.id,
        type: 'DATABASE_EVENT',
        isActive: true,
        instructions: null,
        settings: {
          eventName: 'company.updated',
          updatedFields: ['name', 'futureField'],
        },
      },
      objectLabel: 'Companies',
      fields: [{ name: 'name', label: 'Company name' }],
    }),
  ).toBe('Companies: Updated (Company name, futureField)');
});

it('retains valid Custom cron text when a human description is unavailable', () => {
  const trigger = {
    id: schedule.id,
    type: 'CRON' as const,
    isActive: true,
    instructions: null,
    settings: { pattern: '@daily' },
  };
  expect(getCoreAgentTriggerSummary({ trigger })).toBe('@daily');
  expect(
    getCoreAgentTriggerSummary({
      trigger: { ...trigger, settings: { pattern: 'invalid' } },
    }),
  ).toBe('Invalid schedule');
});
