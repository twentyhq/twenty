import { describe, expect, it } from 'vitest';

import { defineMessagingProvider } from '@/sdk/define';

const baseValidConfig = {
  universalIdentifier: '6b1f0a52-4d8e-4c4e-9b0a-2f5d8a7c1e01',
  name: 'linkedin-messaging',
  displayName: 'LinkedIn Messages',
  connectionProvider: {
    universalIdentifier: '6b1f0a52-4d8e-4c4e-9b0a-2f5d8a7c1e02',
  },
  sendMessageLogicFunction: {
    universalIdentifier: '6b1f0a52-4d8e-4c4e-9b0a-2f5d8a7c1e03',
  },
  startConversationLogicFunction: {
    universalIdentifier: '6b1f0a52-4d8e-4c4e-9b0a-2f5d8a7c1e04',
  },
  markThreadAsReadLogicFunction: {
    universalIdentifier: '6b1f0a52-4d8e-4c4e-9b0a-2f5d8a7c1e05',
  },
};

describe('defineMessagingProvider', () => {
  it('returns success for a valid config', () => {
    const result = defineMessagingProvider(baseValidConfig);

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('accepts a provider that only ingests', () => {
    const {
      sendMessageLogicFunction: _sendMessageLogicFunction,
      startConversationLogicFunction: _startConversationLogicFunction,
      markThreadAsReadLogicFunction: _markThreadAsReadLogicFunction,
      ...ingestOnlyConfig
    } = baseValidConfig;

    expect(defineMessagingProvider(ingestOnlyConfig).success).toBe(true);
  });

  it('rejects a name that is not a slug', () => {
    const result = defineMessagingProvider({
      ...baseValidConfig,
      name: 'LinkedIn Messaging',
    });

    expect(result.success).toBe(false);
  });

  it('rejects references that are not UUIDs', () => {
    const result = defineMessagingProvider({
      ...baseValidConfig,
      connectionProvider: { universalIdentifier: 'unipile' },
      sendMessageLogicFunction: { universalIdentifier: 'send-message' },
      startConversationLogicFunction: {
        universalIdentifier: 'start-conversation',
      },
      markThreadAsReadLogicFunction: { universalIdentifier: 'mark-as-read' },
    });

    expect(result.errors).toHaveLength(4);
  });

  it('accepts a chat conversation style', () => {
    expect(
      defineMessagingProvider({ ...baseValidConfig, conversationStyle: 'chat' })
        .success,
    ).toBe(true);
  });

  it('rejects an unknown conversation style', () => {
    const result = defineMessagingProvider({
      ...baseValidConfig,
      // @ts-expect-error apps written in JavaScript can pass any value
      conversationStyle: 'thread',
    });

    expect(result.success).toBe(false);
  });
});
