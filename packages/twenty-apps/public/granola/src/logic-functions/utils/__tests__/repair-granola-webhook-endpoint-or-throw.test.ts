import { describe, expect, it, vi } from 'vitest';

import { type GranolaWebhookEndpoint } from 'src/logic-functions/types/granola-api.type';
import { GranolaWebhookConfigurationError } from 'src/logic-functions/types/granola-webhook-configuration-error';
import { repairGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/repair-granola-webhook-endpoint-or-throw.util';

const ENDPOINT: GranolaWebhookEndpoint = {
  id: 'whe_2mKr8fQxLp7Ta3',
  object: 'webhook_endpoint',
  url: 'https://example.com/hook',
  url_redacted: false,
  events: ['note.generated', 'note.access_granted', 'note.edited'],
  folder_ids: ['fol_2mKr8fQxLp7Ta3'],
  scopes: ['personal'],
  created_by: null,
  enabled: true,
  created_at: '2026-09-05T10:00:00Z',
};

describe('repairGranolaWebhookEndpointOrThrow', () => {
  it('updates the folder filter on the existing endpoint', async () => {
    const folderIds = ['fol_partnerCalls12'];
    const repairedEndpoint = { ...ENDPOINT, folder_ids: folderIds };
    const updateWebhookEndpoint = vi.fn().mockResolvedValue(repairedEndpoint);

    await expect(
      repairGranolaWebhookEndpointOrThrow({
        client: { updateWebhookEndpoint },
        endpoint: ENDPOINT,
        expectedUrl: ENDPOINT.url,
        folderIds,
      }),
    ).resolves.toEqual(repairedEndpoint);

    expect(updateWebhookEndpoint).toHaveBeenCalledExactlyOnceWith({
      webhookEndpointId: ENDPOINT.id,
      enabled: true,
      folder_ids: folderIds,
    });
  });

  it('rejects an empty filter before it can subscribe to every folder', async () => {
    const updateWebhookEndpoint = vi.fn();

    await expect(
      repairGranolaWebhookEndpointOrThrow({
        client: { updateWebhookEndpoint },
        endpoint: ENDPOINT,
        expectedUrl: ENDPOINT.url,
        folderIds: [],
      }),
    ).rejects.toBeInstanceOf(GranolaWebhookConfigurationError);

    expect(updateWebhookEndpoint).not.toHaveBeenCalled();
  });
});
