import { describe, expect, it } from 'vitest';

import { defineEvent } from '@/sdk/define';

const baseValidConfig = {
  universalIdentifier: '3c1d2a4b-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  name: 'messageAdded',
  label: 'Message added',
  properties: [
    {
      name: 'conversationId',
      type: 'RECORD_REFERENCE' as const,
      objectUniversalIdentifier: '3c1d2a4b-5e6f-4a7b-8c9d-0e1f2a3b4c5e',
      isRequired: true,
    },
    { name: 'text', type: 'TEXT' as const },
  ],
  capabilities: {
    realtime: {
      scopes: [
        { kind: 'record' as const, property: 'conversationId' },
        { kind: 'visitor' as const },
      ],
    },
  },
};

describe('defineEvent', () => {
  it('returns success for a valid config', () => {
    const result = defineEvent(baseValidConfig);

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects a universalIdentifier that is not a UUID', () => {
    const result = defineEvent({
      ...baseValidConfig,
      universalIdentifier: 'message-added',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a record scope on an undeclared property', () => {
    const result = defineEvent({
      ...baseValidConfig,
      capabilities: {
        realtime: { scopes: [{ kind: 'record', property: 'threadId' }] },
      },
    });

    expect(result.success).toBe(false);
  });
});
