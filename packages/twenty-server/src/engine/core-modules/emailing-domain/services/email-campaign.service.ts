import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { In } from 'typeorm';

import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { EmailingDomainSenderService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain-sender.service';
import { EmailGroupMessageCategory } from 'src/engine/core-modules/emailing-domain/types/email-group-message-category.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { EmailCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/email-campaign.workspace-entity';
import { EmailListSubscriptionWorkspaceEntity } from 'src/modules/emailing/standard-objects/email-list-subscription.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { createHtmlToTextConverter } from 'src/modules/messaging/message-import-manager/utils/create-html-to-text-converter.util';

type SendCampaignArgs = {
  workspaceId: string;
  emailListId: string;
  subject: string;
  html: string;
  fromAddress: string;
};

type SendCampaignResult = {
  campaignId: string;
  sentCount: number;
  failedCount: number;
};

const SUBSCRIBED_STATUS = 'SUBSCRIBED';

@Injectable()
export class EmailCampaignService {
  private readonly logger = new Logger(EmailCampaignService.name);
  private readonly htmlToText = createHtmlToTextConverter();

  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly emailingDomainSenderService: EmailingDomainSenderService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async sendToList({
    workspaceId,
    emailListId,
    subject,
    html,
    fromAddress,
  }: SendCampaignArgs): Promise<SendCampaignResult> {
    const fromDomain = fromAddress.split('@')[1]?.toLowerCase();

    const emailingDomain = await this.emailingDomainRepository.findOne(
      workspaceId,
      { where: { domain: fromDomain, status: EmailingDomainStatus.VERIFIED } },
    );

    if (emailingDomain === null) {
      throw new Error(
        `No verified emailing domain matches the from address ${fromAddress}`,
      );
    }

    const text = this.htmlToText(html);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const recipientEmails = await this.resolveSubscribedEmails(
        workspaceId,
        emailListId,
      );

      const campaignRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          EmailCampaignWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      const { identifiers } = await campaignRepository.insert({
        name: subject,
        subject,
        bodyTemplate: html,
        fromAddress,
        status: 'SENDING',
        recipientSource: 'LIST',
        listId: emailListId,
      });
      const campaignId = identifiers[0].id;

      let sentCount = 0;
      let failedCount = 0;

      for (const recipientEmail of recipientEmails) {
        try {
          await this.emailingDomainSenderService.sendEmail(
            workspaceId,
            emailingDomain.id,
            {
              from: fromAddress,
              to: [recipientEmail],
              subject,
              text,
              html,
              messageCategory: EmailGroupMessageCategory.CAMPAIGN,
              emailListId,
            },
          );
          sentCount += 1;
        } catch (error) {
          failedCount += 1;
          this.logger.warn(
            `Campaign ${campaignId} skipped ${recipientEmail}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }

      await campaignRepository.update(campaignId, {
        status: 'SENT',
        sentAt: new Date(),
        sentCount,
        failedCount,
      });

      return { campaignId, sentCount, failedCount };
    }, buildSystemAuthContext(workspaceId));
  }

  private async resolveSubscribedEmails(
    workspaceId: string,
    emailListId: string,
  ): Promise<string[]> {
    const subscriptionRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        EmailListSubscriptionWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

    const subscriptions = await subscriptionRepository.find({
      where: { listId: emailListId, status: SUBSCRIBED_STATUS },
    });

    const personIds = subscriptions.map((subscription) => subscription.personId);

    if (personIds.length === 0) {
      return [];
    }

    const personRepository = await this.globalWorkspaceOrmManager.getRepository(
      workspaceId,
      PersonWorkspaceEntity,
      { shouldBypassPermissionChecks: true },
    );

    const people = await personRepository.find({
      where: { id: In(personIds) },
    });

    return people
      .map((person) => person.emails?.primaryEmail)
      .filter((email): email is string => isNonEmptyString(email));
  }
}
