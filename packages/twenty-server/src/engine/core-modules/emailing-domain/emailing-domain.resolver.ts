import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-driver.type';
import { EmailingDomainDTO } from 'src/engine/core-modules/emailing-domain/dtos/emailing-domain.dto';
import { SendMessageBroadcastInput } from 'src/engine/core-modules/emailing-domain/dtos/send-message-broadcast.input';
import { SendMessageBroadcastOutputDTO } from 'src/engine/core-modules/emailing-domain/dtos/send-message-broadcast-output.dto';
import { SendEmailViaDomainOutputDTO } from 'src/engine/core-modules/emailing-domain/dtos/send-email-via-domain-output.dto';
import { SendEmailViaDomainInput } from 'src/engine/core-modules/emailing-domain/dtos/send-email-via-domain.input';
import { MessageBroadcastService } from 'src/engine/core-modules/emailing-domain/services/message-broadcast.service';
import { EmailingDomainSenderService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain-sender.service';
import { EmailingDomainService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain.service';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(
  WorkspaceAuthGuard,
  FeatureFlagGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
)
@UsePipes(ResolverValidationPipe)
@MetadataResolver(() => EmailingDomainDTO)
export class EmailingDomainResolver {
  constructor(
    private readonly emailingDomainService: EmailingDomainService,
    private readonly emailingDomainSenderService: EmailingDomainSenderService,
    private readonly messageBroadcastService: MessageBroadcastService,
  ) {}

  @Mutation(() => EmailingDomainDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async createEmailingDomain(
    @Args('domain') domain: string,
    @Args('driver') driver: EmailingDomainDriver,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<EmailingDomainDTO> {
    const emailingDomain =
      await this.emailingDomainService.createEmailingDomain(
        domain,
        driver,
        currentWorkspace,
      );

    return emailingDomain;
  }

  @Mutation(() => Boolean)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async deleteEmailingDomain(
    @Args('id') id: string,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<boolean> {
    await this.emailingDomainService.deleteEmailingDomain(currentWorkspace, id);

    return true;
  }

  @Mutation(() => EmailingDomainDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async verifyEmailingDomain(
    @Args('id') id: string,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<EmailingDomainDTO> {
    const emailingDomain =
      await this.emailingDomainService.verifyEmailingDomain(
        currentWorkspace,
        id,
      );

    return emailingDomain;
  }

  @Mutation(() => SendEmailViaDomainOutputDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async sendEmailViaEmailingDomain(
    @Args('input') input: SendEmailViaDomainInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<SendEmailViaDomainOutputDTO> {
    const { emailingDomainId, ...content } = input;
    const result = await this.emailingDomainSenderService.sendEmail(
      currentWorkspace.id,
      emailingDomainId,
      content,
    );

    return { messageId: result.messageId };
  }

  @Mutation(() => SendMessageBroadcastOutputDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async sendMessageBroadcast(
    @Args('input') input: SendMessageBroadcastInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<SendMessageBroadcastOutputDTO> {
    return this.messageBroadcastService.send({
      workspaceId: currentWorkspace.id,
      messageTopicId: input.messageTopicId,
      recipientViewId: input.recipientViewId,
      segmentId: input.segmentId,
      subject: input.subject,
      html: input.body,
      fromAddress: input.fromAddress,
    });
  }

  @Query(() => [EmailingDomainDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async getEmailingDomains(
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<EmailingDomainDTO[]> {
    const emailingDomains =
      await this.emailingDomainService.getEmailingDomains(currentWorkspace);

    return emailingDomains;
  }
}
