import { describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { findWhatsAppCampaignRecipients } from 'src/logic-functions/data/find-whatsapp-campaign-recipients.util';

const buildMessage = ({ id, status, handle }: { id: string; status: string; handle: string }) => ({
  node: {
    id,
    receivedAt: '2026-11-20T10:00:00.000Z',
    whatsAppStatus: status,
    whatsAppStatusError: null,
    messageParticipants: {
      edges: [
        { node: { role: 'FROM', handle: '+1 555 078 3881', displayName: null, person: null } },
        { node: { role: 'TO', handle, displayName: null, person: { name: { firstName: 'Ada', lastName: 'Lovelace' } } } },
      ],
    },
  },
});

describe('findWhatsAppCampaignRecipients', () => {
  it('should mark recipients whose conversation got an incoming message after the campaign', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        messages: {
          edges: [
            buildMessage({ id: 'message-1', status: 'READ', handle: '16505551234' }),
            buildMessage({ id: 'message-2', status: 'DELIVERED', handle: '16505559999' }),
          ],
        },
      })
      .mockResolvedValueOnce({
        messageChannelMessageAssociations: {
          edges: [
            { node: { messageId: 'message-1', messageThreadExternalId: 'thread-1' } },
            { node: { messageId: 'message-2', messageThreadExternalId: 'thread-2' } },
          ],
        },
      })
      .mockResolvedValueOnce({
        messageChannelMessageAssociations: { edges: [{ node: { messageThreadExternalId: 'thread-1' } }] },
      });

    const recipients = await findWhatsAppCampaignRecipients({
      client: { query } as unknown as CoreApiClient,
      campaignId: 'campaign-id',
      campaignCreatedAt: '2026-11-20T09:00:00.000Z',
    });

    expect(recipients).toEqual([
      expect.objectContaining({ messageId: 'message-1', recipientName: 'Ada Lovelace', status: 'READ', hasReplied: true }),
      expect.objectContaining({ messageId: 'message-2', recipientHandle: '16505559999', hasReplied: false }),
    ]);
    expect(query.mock.calls[2]?.[0].messageChannelMessageAssociations.__args.filter).toEqual({
      messageThreadExternalId: { in: ['thread-1', 'thread-2'] },
      direction: { eq: 'INCOMING' },
      createdAt: { gt: '2026-11-20T09:00:00.000Z' },
    });
  });

  it('should keep reading reply pages until every conversation is found', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        messages: {
          edges: [
            buildMessage({ id: 'message-1', status: 'READ', handle: '16505551234' }),
            buildMessage({ id: 'message-2', status: 'READ', handle: '16505559999' }),
          ],
        },
      })
      .mockResolvedValueOnce({
        messageChannelMessageAssociations: {
          edges: [
            { node: { messageId: 'message-1', messageThreadExternalId: 'thread-1' } },
            { node: { messageId: 'message-2', messageThreadExternalId: 'thread-2' } },
          ],
        },
      })
      .mockResolvedValueOnce({
        messageChannelMessageAssociations: {
          edges: [{ node: { messageThreadExternalId: 'thread-1' } }, { node: { messageThreadExternalId: 'thread-1' } }],
          pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
        },
      })
      .mockResolvedValueOnce({
        messageChannelMessageAssociations: {
          edges: [{ node: { messageThreadExternalId: 'thread-2' } }],
          pageInfo: { hasNextPage: true, endCursor: 'cursor-2' },
        },
      });

    const recipients = await findWhatsAppCampaignRecipients({
      client: { query } as unknown as CoreApiClient,
      campaignId: 'campaign-id',
      campaignCreatedAt: '2026-11-20T09:00:00.000Z',
    });

    expect(recipients.map(({ hasReplied }) => hasReplied)).toEqual([true, true]);
    expect(query.mock.calls[3]?.[0].messageChannelMessageAssociations.__args.after).toBe('cursor-1');
    expect(query).toHaveBeenCalledTimes(4);
  });
});
