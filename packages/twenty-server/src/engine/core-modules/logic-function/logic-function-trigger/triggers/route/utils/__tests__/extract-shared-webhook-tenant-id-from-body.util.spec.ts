import { extractSharedWebhookTenantIdFromBody } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/extract-shared-webhook-tenant-id-from-body.util';

describe('extractSharedWebhookTenantIdFromBody', () => {
  it('reads the first tenant id found at a declared path', () => {
    expect(
      extractSharedWebhookTenantIdFromBody({
        body: {
          data: {
            bot: {
              metadata: {
                twentyWorkspaceId: 'workspace-id',
              },
            },
          },
        },
        tenantIdPaths: [
          'bot.metadata.twentyWorkspaceId',
          'data.bot.metadata.twentyWorkspaceId',
        ],
      }),
    ).toBe('workspace-id');
  });

  it('does not scan undeclared paths', () => {
    expect(
      extractSharedWebhookTenantIdFromBody({
        body: {
          unexpected: {
            metadata: {
              twentyWorkspaceId: 'workspace-id',
            },
          },
        },
        tenantIdPaths: ['data.bot.metadata.twentyWorkspaceId'],
      }),
    ).toBeUndefined();
  });

  it('returns undefined for missing or non-string tenant ids', () => {
    expect(
      extractSharedWebhookTenantIdFromBody({
        body: {
          data: {
            bot: {
              metadata: {
                twentyWorkspaceId: 123,
              },
            },
          },
        },
        tenantIdPaths: ['data.bot.metadata.twentyWorkspaceId'],
      }),
    ).toBeUndefined();

    expect(
      extractSharedWebhookTenantIdFromBody({
        body: null,
        tenantIdPaths: ['data.bot.metadata.twentyWorkspaceId'],
      }),
    ).toBeUndefined();
  });
});
