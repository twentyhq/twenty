import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { buildAgentTriggerMessages } from 'src/engine/metadata-modules/ai/ai-agent-trigger/utils/build-agent-trigger-messages.util';

describe('buildAgentTriggerMessages', () => {
  it('should describe a cron firing and append the instructions', () => {
    const [message] = buildAgentTriggerMessages({
      instructions: 'Send the weekly pipeline digest',
      payload: { type: 'CRON', firedAt: '2026-10-05T09:00:00.000Z' },
    });

    expect(message.role).toBe('user');
    expect(message.content).toContain('2026-10-05T09:00:00.000Z');
    expect(message.content).toContain('Send the weekly pipeline digest');
  });

  it('should include the event records and fall back to default instructions', () => {
    const event = {
      recordId: 'company-id',
      properties: { after: { name: 'Acme' } },
    } as ObjectRecordEvent;

    const [message] = buildAgentTriggerMessages({
      instructions: null,
      payload: {
        type: 'DATABASE_EVENT',
        eventName: 'company.created',
        objectNameSingular: 'company',
        events: [event],
      },
    });

    expect(message.content).toContain('"company.created"');
    expect(message.content).toContain('"name": "Acme"');
    expect(message.content).toContain(
      'Act on this according to your instructions.',
    );
  });
});
