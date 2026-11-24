import { Injectable, Logger } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ApplicationBillingPriceService } from 'src/engine/core-modules/application/application-billing-price/application-billing-price.service';
import { formatApplicationBillingPrice } from 'src/engine/core-modules/application/utils/format-application-billing-price.util';
import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';
import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { type ConnectedAccountBilledEvent } from 'src/engine/metadata-modules/connected-account/types/connected-account-billed.type';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const BILLED_CONNECTED_ACCOUNTS_THREAD_KEY = 'billed-connected-accounts';

const RECIPIENT_PERMISSION_FLAGS = [
  PermissionFlagType.BILLING,
  PermissionFlagType.AI,
];

type NotifyBillingMembersArgs = ConnectedAccountBilledEvent & {
  workspaceId: string;
};

const getWorkspaceMemberDisplayName = (
  member: Pick<FlatWorkspaceMember, 'name' | 'userEmail'> | undefined,
): string =>
  `${member?.name?.firstName ?? ''} ${member?.name?.lastName ?? ''}`.trim() ||
  (member?.userEmail ?? 'A member');

@Injectable()
export class ConnectedAccountBillingNotificationService {
  private readonly logger = new Logger(
    ConnectedAccountBillingNotificationService.name,
  );

  constructor(
    private readonly applicationBillingPriceService: ApplicationBillingPriceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly settingPermissionsService: SettingPermissionsService,
    private readonly agentInboxService: AgentInboxService,
  ) {}

  async notifyBillingMembers(args: NotifyBillingMembersArgs): Promise<void> {
    try {
      await this.sendNotification(args);
    } catch (error) {
      this.logger.warn(
        doNotTranslate(
          `Could not notify billing members of connected account ${args.connectedAccountId} in workspace ${args.workspaceId}: ${formatErrorWithCause(error)}`,
        ),
      );
    }
  }

  private async sendNotification({
    workspaceId,
    connectedAccountId,
    applicationId,
    handle,
    userWorkspaceId,
    connectionProviderDisplayName,
    billedAt,
  }: NotifyBillingMembersArgs): Promise<void> {
    const prices =
      await this.applicationBillingPriceService.findConnectedAccountPrices({
        workspaceId,
        applicationId,
      });

    if (!isNonEmptyArray(prices)) {
      return;
    }

    const { flatApplicationMaps, flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
        'flatWorkspaceMemberMaps',
      ]);

    const application = flatApplicationMaps.byId[applicationId];

    if (!isDefined(application)) {
      return;
    }

    const connectingMemberId =
      flatWorkspaceMemberMaps.idByUserWorkspaceId[userWorkspaceId];
    const connectingMember = isDefined(connectingMemberId)
      ? flatWorkspaceMemberMaps.byId[connectingMemberId]
      : undefined;

    const recipientWorkspaceMemberIds = await this.findRecipientIds({
      workspaceId,
      workspaceMembers: Object.values(flatWorkspaceMemberMaps.byId)
        .filter(isDefined)
        .filter((member) => member.id !== connectingMemberId),
      userWorkspaceIdByUserId: flatWorkspaceMemberMaps.userWorkspaceIdByUserId,
    });

    if (!isNonEmptyArray(recipientWorkspaceMemberIds)) {
      return;
    }

    const connectedBy = getWorkspaceMemberDisplayName(connectingMember);
    const formattedPrices = prices
      .map(formatApplicationBillingPrice)
      .join(', ');

    await this.agentInboxService.sendMessage({
      workspaceId,
      sender: { type: 'application', application },
      input: {
        workspaceMemberIds: recipientWorkspaceMemberIds,
        threadKey: BILLED_CONNECTED_ACCOUNTS_THREAD_KEY,
        idempotencyKey: `${connectedAccountId}:${billedAt}`,
        title: `${application.name} connected accounts`,
        text: `${connectedBy} connected the ${connectionProviderDisplayName} account ${handle}. It adds ${formattedPrices} to your workspace subscription.`,
      },
    });
  }

  private async findRecipientIds({
    workspaceId,
    workspaceMembers,
    userWorkspaceIdByUserId,
  }: {
    workspaceId: string;
    workspaceMembers: Pick<FlatWorkspaceMember, 'id' | 'userId'>[];
    userWorkspaceIdByUserId: Partial<Record<string, string>>;
  }): Promise<string[]> {
    const recipientIds = await Promise.all(
      workspaceMembers.map(async ({ id, userId }) => {
        const userWorkspaceId = userWorkspaceIdByUserId[userId];

        if (!isDefined(userWorkspaceId)) {
          return null;
        }

        const flagChecks = await Promise.all(
          RECIPIENT_PERMISSION_FLAGS.map((permissionFlag) =>
            this.settingPermissionsService.userWorkspaceHasPermissionFlag({
              workspaceId,
              userWorkspaceId,
              permissionFlag,
            }),
          ),
        );

        return flagChecks.every(Boolean) ? id : null;
      }),
    );

    return recipientIds.filter(isDefined);
  }
}
