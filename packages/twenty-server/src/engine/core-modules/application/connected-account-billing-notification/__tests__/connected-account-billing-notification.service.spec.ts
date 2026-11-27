import { Test, type TestingModule } from '@nestjs/testing';

import { PermissionFlagType } from 'twenty-shared/constants';

import { ApplicationBillingPriceService } from 'src/engine/core-modules/application/application-billing-price/application-billing-price.service';
import { ConnectedAccountBillingNotificationService } from 'src/engine/core-modules/application/connected-account-billing-notification/connected-account-billing-notification.service';
import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION = { id: 'application-id', name: 'LinkedIn' };

const BILLED_CONNECTED_ACCOUNT = {
  workspaceId: WORKSPACE_ID,
  connectedAccountId: 'connected-account-id',
  applicationId: APPLICATION.id,
  handle: 'jane@linkedin.com',
  userWorkspaceId: 'jane-user-workspace-id',
  connectionProviderDisplayName: 'LinkedIn',
  billedAt: '2026-11-24T10:00:00.000Z',
};

const MONTHLY_CONNECTED_ACCOUNT_PRICE = {
  universalIdentifier: 'price-id',
  label: 'Per connected account',
  type: 'RECURRING' as const,
  billingPeriod: 'MONTHLY' as const,
  amountCents: 700,
  currency: 'USD' as const,
  per: 'CONNECTED_ACCOUNT' as const,
};

const buildMember = (name: string) => ({
  id: `${name}-member-id`,
  userId: `${name}-user-id`,
  userEmail: `${name}@example.com`,
  name: { firstName: name, lastName: 'Doe' },
});

const MEMBERS = ['jane', 'admin', 'viewer'].map(buildMember);

const PERMISSION_FLAGS_BY_USER_WORKSPACE_ID: Record<
  string,
  PermissionFlagType[]
> = {
  'jane-user-workspace-id': [PermissionFlagType.BILLING, PermissionFlagType.AI],
  'admin-user-workspace-id': [
    PermissionFlagType.BILLING,
    PermissionFlagType.AI,
  ],
  'viewer-user-workspace-id': [PermissionFlagType.AI],
};

describe('ConnectedAccountBillingNotificationService', () => {
  let service: ConnectedAccountBillingNotificationService;
  let findConnectedAccountPrices: jest.Mock;
  let sendMessage: jest.Mock;

  beforeEach(async () => {
    findConnectedAccountPrices = jest
      .fn()
      .mockResolvedValue([MONTHLY_CONNECTED_ACCOUNT_PRICE]);
    sendMessage = jest.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectedAccountBillingNotificationService,
        {
          provide: ApplicationBillingPriceService,
          useValue: { findConnectedAccountPrices },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: jest.fn().mockResolvedValue({
              flatApplicationMaps: {
                byId: { [APPLICATION.id]: APPLICATION },
              },
              flatWorkspaceMemberMaps: {
                byId: Object.fromEntries(
                  MEMBERS.map((member) => [member.id, member]),
                ),
                idByUserWorkspaceId: Object.fromEntries(
                  MEMBERS.map((member) => [
                    member.userId.replace('user-id', 'user-workspace-id'),
                    member.id,
                  ]),
                ),
                userWorkspaceIdByUserId: Object.fromEntries(
                  MEMBERS.map((member) => [
                    member.userId,
                    member.userId.replace('user-id', 'user-workspace-id'),
                  ]),
                ),
              },
            }),
          },
        },
        {
          provide: SettingPermissionsService,
          useValue: {
            userWorkspaceHasPermissionFlag: jest.fn(
              async ({
                userWorkspaceId,
                permissionFlag,
              }: {
                userWorkspaceId: string;
                permissionFlag: PermissionFlagType;
              }) =>
                (
                  PERMISSION_FLAGS_BY_USER_WORKSPACE_ID[userWorkspaceId] ?? []
                ).includes(permissionFlag),
            ),
          },
        },
        { provide: AgentInboxService, useValue: { sendMessage } },
      ],
    }).compile();

    service = module.get(ConnectedAccountBillingNotificationService);
  });

  it('notifies the other billing members in their inbox', async () => {
    await service.notifyBillingMembers(BILLED_CONNECTED_ACCOUNT);

    expect(sendMessage).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      sender: { type: 'application', application: APPLICATION },
      input: {
        workspaceMemberIds: ['admin-member-id'],
        threadKey: 'billed-connected-accounts',
        idempotencyKey: 'connected-account-id:2026-11-24T10:00:00.000Z',
        title: 'LinkedIn connected accounts',
        text: 'jane Doe connected the LinkedIn account jane@linkedin.com. It adds $7.00 / month per connected account to your workspace subscription.',
      },
    });
  });

  it('sends nothing when the connection is not billed', async () => {
    findConnectedAccountPrices.mockResolvedValue([]);

    await service.notifyBillingMembers(BILLED_CONNECTED_ACCOUNT);

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('does not fail the connection when the inbox rejects the message', async () => {
    sendMessage.mockRejectedValue(new Error('inbox unavailable'));

    await expect(
      service.notifyBillingMembers(BILLED_CONNECTED_ACCOUNT),
    ).resolves.toBeUndefined();
  });
});
