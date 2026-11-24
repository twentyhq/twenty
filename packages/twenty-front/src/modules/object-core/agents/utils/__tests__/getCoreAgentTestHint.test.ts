import { type AgentTrigger } from 'twenty-shared/application';

import { getCoreAgentTestHint } from '@/object-core/agents/utils/getCoreAgentTestHint';

const TRIGGER_ID = '6f1b5a3e-3c3f-4f4a-9a43-0a7f5d6c2b11';

const getHint = (triggers: AgentTrigger[]) =>
  getCoreAgentTestHint({
    triggers,
    getTriggerDetails: () => 'People',
    getObjectLabelSingular: (objectNameSingular) =>
      objectNameSingular === 'person' ? 'Person' : undefined,
  });

describe('getCoreAgentTestHint', () => {
  it('gives no hint to an agent without an active trigger', () => {
    expect(getHint([])).toBeUndefined();
    expect(
      getHint([
        {
          id: TRIGGER_ID,
          type: 'CRON',
          isActive: false,
          instructions: 'Send the weekly digest',
          settings: { pattern: '0 9 * * 1' },
        },
      ]),
    ).toBeUndefined();
  });

  it('asks for a scheduled task on a schedule', () => {
    expect(
      getHint([
        {
          id: TRIGGER_ID,
          type: 'CRON',
          isActive: true,
          instructions: 'Send the weekly digest',
          settings: { pattern: '0 9 * * 1' },
        },
      ])?.placeholder,
    ).toBe('Do your scheduled task now');
  });

  it('asks for a record of the trigger object on a record trigger', () => {
    const hint = getHint([
      {
        id: TRIGGER_ID,
        type: 'DATABASE_EVENT',
        isActive: true,
        instructions: 'Qualify the lead',
        settings: { eventName: 'person.created' },
      },
    ]);

    expect(hint?.placeholder).toBe('Describe a person and what changed on it');
    expect(hint?.description).toContain('for People, with that record');
  });
});
