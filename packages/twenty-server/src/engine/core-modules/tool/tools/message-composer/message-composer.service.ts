import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MessageChannelType } from 'twenty-shared/types';
import { assertUnreachable, isDefined, isValidUuid } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { EmailComposerService } from 'src/engine/core-modules/tool/tools/email-tool/email-composer.service';
import { type ComposeEmailParams } from 'src/engine/core-modules/tool/tools/email-tool/types/compose-email-params.type';
import { type EmailComposerResult } from 'src/engine/core-modules/tool/tools/email-tool/types/email-composer-result.type';
import { AppMessageComposerService } from 'src/engine/core-modules/tool/tools/message-composer/app-message-composer.service';
import {
  MessageComposerException,
  MessageComposerExceptionCode,
} from 'src/engine/core-modules/tool/tools/message-composer/exceptions/message-composer.exception';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

@Injectable()
export class MessageComposerService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly emailComposerService: EmailComposerService,
    private readonly appMessageComposerService: AppMessageComposerService,
  ) {}

  async composeMessage(
    parameters: ComposeEmailParams,
    context: ToolExecutionContext,
  ): Promise<EmailComposerResult> {
    const connectedAccount = await this.findConnectedAccountWithMessageChannels(
      parameters.connectedAccountId,
      context.workspaceId,
    );

    const messageChannel = connectedAccount?.messageChannels[0];

    if (!isDefined(connectedAccount) || !isDefined(messageChannel)) {
      return this.emailComposerService.composeEmail(parameters, context);
    }

    switch (messageChannel.type) {
      case MessageChannelType.EMAIL:
      case MessageChannelType.EMAIL_GROUP:
        return this.emailComposerService.composeEmail(parameters, context);
      case MessageChannelType.APP:
        return this.appMessageComposerService.composeAppMessage({
          parameters,
          connectedAccount,
        });
      case MessageChannelType.SMS:
        throw new MessageComposerException(
          `Message channel type ${messageChannel.type} does not support composing messages`,
          MessageComposerExceptionCode.MESSAGE_CHANNEL_TYPE_NOT_SUPPORTED,
        );
      default:
        assertUnreachable(
          messageChannel.type,
          `Message channel type ${messageChannel.type} not supported for composing messages`,
        );
    }
  }

  private async findConnectedAccountWithMessageChannels(
    connectedAccountId: string | undefined,
    workspaceId: string,
  ): Promise<ConnectedAccountEntity | null> {
    if (!isDefined(connectedAccountId) || !isValidUuid(connectedAccountId)) {
      return null;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.connectedAccountRepository.findOne({
          where: { id: connectedAccountId, workspaceId },
          relations: { messageChannels: true },
        }),
      authContext,
    );
  }
}
