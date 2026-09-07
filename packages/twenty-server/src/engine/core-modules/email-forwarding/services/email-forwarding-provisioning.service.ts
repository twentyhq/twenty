import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PermissionFlagType } from 'twenty-shared/constants';
import {
  type ConnectedAccountProvider,
  MessageChannelType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { EmailForwardingSetupService } from 'src/engine/core-modules/email-forwarding/services/email-forwarding-setup.service';
import { EmailForwardingService } from 'src/engine/core-modules/email-forwarding/services/email-forwarding.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

// Runs inside the OAuth callback while the access token is still in memory. Nothing
// about the grant outlives the request: no connected account, no stored token.
@Injectable()
export class EmailForwardingProvisioningService {
  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly permissionsService: PermissionsService,
    private readonly emailForwardingService: EmailForwardingService,
    private readonly emailForwardingSetupService: EmailForwardingSetupService,
  ) {}

  async provisionFromOauthGrant({
    messageChannelId,
    workspaceId,
    userId,
    provider,
    accessToken,
  }: {
    messageChannelId: string;
    workspaceId: string;
    userId: string;
    provider: ConnectedAccountProvider;
    accessToken: string;
  }): Promise<string | null> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId, workspaceId },
    });

    const hasPermission =
      isDefined(userWorkspace) &&
      (await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId: userWorkspace.id,
        workspaceId,
        setting: PermissionFlagType.WORKSPACE,
      }));

    if (!hasPermission) {
      return 'Only a workspace administrator can set up email forwarding.';
    }

    const messageChannel = await this.messageChannelRepository.findOne({
      where: {
        id: messageChannelId,
        workspaceId,
        type: MessageChannelType.EMAIL_GROUP,
      },
    });

    if (!isDefined(messageChannel)) {
      return 'This email channel no longer exists.';
    }

    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: { id: messageChannel.connectedAccountId, workspaceId },
    });

    if (!isDefined(connectedAccount)) {
      return 'This email channel has no source address.';
    }

    const failureReason =
      await this.emailForwardingService.createForwardingAddress({
        workspaceId,
        provider,
        accessToken,
        sourceAddress: connectedAccount.handle,
        destinationAddress: messageChannel.handle,
        displayName: messageChannel.displayName ?? connectedAccount.handle,
      });

    if (isDefined(failureReason)) {
      return failureReason;
    }

    await this.emailForwardingSetupService.setStatus({
      workspaceId,
      messageChannelId,
      status: 'PROVISIONED',
    });

    return null;
  }
}
