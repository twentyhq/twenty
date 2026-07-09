import { type MetadataApiClient } from 'twenty-client-sdk/metadata';
import { describe, expect, it, vi } from 'vitest';

import { resolveWhatsappMessageChannelId } from 'src/logic-functions/utils/resolve-whatsapp-message-channel-id.util';

type ConnectedAccountFixture = {
  handle: string;
  messageChannels: { id: string; type: string }[];
};

const buildMetadataClient = (
  appConnectedAccounts: ConnectedAccountFixture[],
): MetadataApiClient =>
  ({
    query: vi.fn(() => Promise.resolve({ appConnectedAccounts })),
  }) as unknown as MetadataApiClient;

describe('resolveWhatsappMessageChannelId', () => {
  it('returns the channel id when a single APP message channel exists', async () => {
    const metadataClient = buildMetadataClient([
      {
        handle: 'WhatsApp #1',
        messageChannels: [{ id: 'channel-1', type: 'APP' }],
      },
    ]);

    await expect(
      resolveWhatsappMessageChannelId({ metadataClient }),
    ).resolves.toBe('channel-1');
  });

  it('ignores non-APP message channels', async () => {
    const metadataClient = buildMetadataClient([
      {
        handle: 'WhatsApp #1',
        messageChannels: [
          { id: 'channel-email', type: 'EMAIL' },
          { id: 'channel-app', type: 'APP' },
        ],
      },
    ]);

    await expect(
      resolveWhatsappMessageChannelId({ metadataClient }),
    ).resolves.toBe('channel-app');
  });

  it('throws when no APP message channel exists', async () => {
    const metadataClient = buildMetadataClient([]);

    await expect(
      resolveWhatsappMessageChannelId({ metadataClient }),
    ).rejects.toThrow('No WhatsApp message channel found');
  });

  it('throws listing candidates when multiple APP message channels exist', async () => {
    const metadataClient = buildMetadataClient([
      {
        handle: 'WhatsApp #1',
        messageChannels: [{ id: 'channel-1', type: 'APP' }],
      },
      {
        handle: 'WhatsApp #2',
        messageChannels: [{ id: 'channel-2', type: 'APP' }],
      },
    ]);

    await expect(
      resolveWhatsappMessageChannelId({ metadataClient }),
    ).rejects.toThrow('WhatsApp #1 (channel-1), WhatsApp #2 (channel-2)');
  });
});
