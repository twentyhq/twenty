import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { EMAIL_GROUP_FORWARDING_SETUP_USER_VAR_KEY } from 'src/engine/core-modules/email-forwarding/constants/email-group-forwarding-setup-user-var-key.constant';
import { type EmailGroupForwardingSetupStatus } from 'src/engine/core-modules/email-forwarding/types/email-group-forwarding-setup-status.type';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';

type EmailGroupForwardingSetupByChannelId = Record<
  string,
  EmailGroupForwardingSetupStatus
>;

// Whether a channel still needs the forwarding prompt is the only state we keep,
// so it lives as a workspace key value pair rather than its own table.
@Injectable()
export class EmailForwardingSetupService {
  constructor(private readonly userVarsService: UserVarsService) {}

  async findAllByWorkspaceId(
    workspaceId: string,
  ): Promise<EmailGroupForwardingSetupByChannelId> {
    const setupByChannelId = await this.userVarsService.get({
      workspaceId,
      key: EMAIL_GROUP_FORWARDING_SETUP_USER_VAR_KEY,
    });

    return isDefined(setupByChannelId) ? setupByChannelId : {};
  }

  async setStatus({
    workspaceId,
    messageChannelId,
    status,
  }: {
    workspaceId: string;
    messageChannelId: string;
    status: EmailGroupForwardingSetupStatus;
  }): Promise<void> {
    const setupByChannelId = await this.findAllByWorkspaceId(workspaceId);

    setupByChannelId[messageChannelId] = status;

    await this.userVarsService.set({
      workspaceId,
      key: EMAIL_GROUP_FORWARDING_SETUP_USER_VAR_KEY,
      value: setupByChannelId,
    });
  }

  async removeChannel({
    workspaceId,
    messageChannelId,
  }: {
    workspaceId: string;
    messageChannelId: string;
  }): Promise<void> {
    const setupByChannelId = await this.findAllByWorkspaceId(workspaceId);

    if (!isDefined(setupByChannelId[messageChannelId])) {
      return;
    }

    delete setupByChannelId[messageChannelId];

    await this.userVarsService.set({
      workspaceId,
      key: EMAIL_GROUP_FORWARDING_SETUP_USER_VAR_KEY,
      value: setupByChannelId,
    });
  }
}
