import { describe, expect, it } from 'vitest';

import { defineEvent, type EventManifest } from '@/sdk/define';

const baseValidConfig: EventManifest = {
  universalIdentifier: '3c1d2a4b-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  name: 'messageAdded',
  label: 'Message added',
  schema: {
    type: 'object',
    properties: {
      conversationId: {
        type: 'record',
        objectUniversalIdentifier: '3c1d2a4b-5e6f-4a7b-8c9d-0e1f2a3b4c5e',
      },
      text: { type: 'string' },
    },
    required: ['conversationId'],
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

  it('accepts an event without a schema', () => {
    const { schema: _schema, ...configWithoutSchema } = baseValidConfig;

    expect(defineEvent(configWithoutSchema).success).toBe(true);
  });

  it('rejects a nested property', () => {
    const result = defineEvent({
      ...baseValidConfig,
      schema: {
        type: 'object',
        properties: {
          author: { type: 'object', properties: { name: { type: 'string' } } },
        },
      },
    });

    expect(result.success).toBe(false);
  });
});
