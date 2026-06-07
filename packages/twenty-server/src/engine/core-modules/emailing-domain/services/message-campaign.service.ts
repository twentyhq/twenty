import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { isNonEmptyString } from '@sniptt/guards';
import { In } from 'typeorm';
import { v4 } from 'uuid';

import {
  CAMPAIGN_MESSAGE_DELIVERY_STATUS,
  CAMPAIGN_STATUS,
  MAX_CAMPAIGN_RECIPIENTS,
  SEND_CAMPAIGN_EMAIL_JOB,
} from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { EmailingDomainSenderService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain-sender.service';
import { EmailGroupMessageCategory } from 'src/engine/core-modules/emailing-domain/types/email-group-message-category.type';
import { type SendCampaignEmailJobData } from 'src/engine/core-modules/emailing-domain/types/send-campaign-email-job-data.type';
import {
  type CampaignRecipient,
  type CampaignSkippedBreakdown,
  normalizeCampaignRecipients,
  type RawCampaignRecipient,
} from 'src/engine/core-modules/emailing-domain/utils/normalize-campaign-recipients.util';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MessageChannelMetadataService } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.service';
import { ViewQueryParamsService } from 'src/engine/metadata-modules/view/services/view-query-params.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { MessageListMemberWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list-member.workspace-entity';
import { MessageTopicSubscriptionWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-topic-subscription.workspace-entity';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { MessageParticipantRole } from 'twenty-shared/types';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { createHtmlToTextConverter } from 'src/modules/messaging/message-import-manager/utils/create-html-to-text-converter.util';
import { getDomainFromEmail } from 'src/utils/get-domain-from-email';

type SendCampaignArgs = {
  workspaceId: string;
  userWorkspaceId: string;
  messageTopicId: string;
  subject: string;
  html: string;
  fromAddress: string;
  // When set, recipients come from this Person view's filters (dynamic audience).
  // Otherwise recipients are the people subscribed to the topic.
  recipientViewId?: string;
  // When set, recipients are the list's hand-picked members (static audience).
  // Takes precedence over recipientViewId and topic subscribers.
  listId?: string;
};

type SendCampaignResult = {
  campaignId: string;
  queuedCount: number;
  skipped: CampaignSkippedBreakdown;
};

const SUBSCRIBED_STATUS = 'SUBSCRIBED';
const PERSON_OBJECT_NAME = 'person';

@Injectable()
export class MessageCampaignService {
  private readonly logger = new Logger(MessageCampaignService.name);
  private readonly htmlToText = createHtmlToTextConverter();

  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly emailingDomainSenderService: EmailingDomainSenderService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectMessageQueue(MessageQueue.emailQueue)
    private readonly messageQueueService: MessageQueueService,
    // Resolved lazily to avoid a module-load cycle: the record-crud/view and
    // message-channel graphs cannot be eagerly imported from this early-loaded
    // core module without a require-time TDZ.
    private readonly moduleRef: ModuleRef,
  ) {}

  // Orchestrates a campaign send: resolves the verified domain + email-group
  // channel, materializes one QUEUED message per recipient, and enqueues a send
  // job each. Sending happens asynchronously in the job, not in this request.
  async send({
    workspaceId,
    userWorkspaceId,
    messageTopicId,
    subject,
    html,
    fromAddress,
    recipientViewId,
    listId,
  }: SendCampaignArgs): Promise<SendCampaignResult> {
    const fromDomain = getDomainFromEmail(fromAddress)?.toLowerCase();

    const emailingDomain = await this.emailingDomainRepository.findOne(
      workspaceId,
      { where: { domain: fromDomain, status: EmailingDomainStatus.VERIFIED } },
    );

    if (emailingDomain === null) {
      throw new Error(
        `No verified emailing domain matches the from address ${fromAddress}`,
      );
    }

    const messageChannelMetadataService = this.moduleRef.get(
      MessageChannelMetadataService,
      { strict: false },
    );

    const messageChannel =
      await messageChannelMetadataService.getOrCreateEmailGroupChannel({
        fromAddress,
        userWorkspaceId,
        workspaceId,
      });

    const text = this.htmlToText(html);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const rawRecipients = isNonEmptyString(listId)
          ? await this.resolveRecipientsFromList(workspaceId, listId)
          : isNonEmptyString(recipientViewId)
            ? await this.resolveRecipientsFromView(workspaceId, recipientViewId)
            : await this.resolveSubscribedRecipients(
                workspaceId,
                messageTopicId,
              );

        const { recipients, skipped } = normalizeCampaignRecipients(
          rawRecipients,
          MAX_CAMPAIGN_RECIPIENTS,
        );

        const campaignRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            MessageCampaignWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const { identifiers } = await campaignRepository.insert({
          name: subject,
          subject,
          bodyTemplate: html,
          fromAddress,
          status: CAMPAIGN_STATUS.SENDING,
          recipientSource:
            isNonEmptyString(listId) || isNonEmptyString(recipientViewId)
              ? 'FILTER'
              : 'LIST',
          recipientViewId: recipientViewId ?? null,
          topicId: messageTopicId,
        });
        const campaignId = identifiers[0].id;

        for (const recipient of recipients) {
          const messageId = await this.materializeCampaignMessage({
            workspaceId,
            campaignId,
            messageChannelId: messageChannel.id,
            fromAddress,
            recipient,
            subject,
            text,
          });

          await this.messageQueueService.add<SendCampaignEmailJobData>(
            SEND_CAMPAIGN_EMAIL_JOB,
            {
              workspaceId,
              campaignId,
              messageId,
              recipientEmail: recipient.email,
              emailingDomainId: emailingDomain.id,
              messageTopicId,
              fromAddress,
              subject,
              html,
            },
            { retryLimit: 3 },
          );
        }

        // Marks the campaign SENT immediately when nothing was queued
        // (zero-recipient case); otherwise the last send job finalizes it.
        await this.finalizeCampaignIfComplete(workspaceId, campaignId);

        return { campaignId, queuedCount: recipients.length, skipped };
      },
      buildSystemAuthContext(workspaceId),
    );
  }

  // Processes one recipient's send job: idempotent, sends via the emailing-domain
  // sender (keeps suppression + unsubscribe + reply-to), records per-message
  // status, and finalizes the campaign once nothing remains queued.
  async processSendJob(data: SendCampaignEmailJobData): Promise<void> {
    const {
      workspaceId,
      campaignId,
      messageId,
      recipientEmail,
      emailingDomainId,
      messageTopicId,
      fromAddress,
      subject,
      html,
    } = data;

    const text = this.htmlToText(html);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          MessageWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      const message = await messageRepository.findOne({
        where: { id: messageId },
      });

      // Idempotency: BullMQ may retry. Only a still-QUEUED message is sent.
      if (
        message === null ||
        message.deliveryStatus !== CAMPAIGN_MESSAGE_DELIVERY_STATUS.QUEUED
      ) {
        return;
      }

      try {
        const result = await this.emailingDomainSenderService.sendEmail(
          workspaceId,
          emailingDomainId,
          {
            from: fromAddress,
            to: [recipientEmail],
            subject,
            text,
            html,
            messageCategory: EmailGroupMessageCategory.CAMPAIGN,
            messageTopicId,
          },
        );

        // Adopt the SES id as the message id so a reply (whose In-Reply-To
        // references it) threads back onto this send, mirroring the existing
        // email-group outbound model.
        await messageRepository.update(messageId, {
          deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT,
          headerMessageId: result.messageId,
        });

        const associationRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            MessageChannelMessageAssociationWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        await associationRepository.update(
          { messageId },
          {
            messageExternalId: result.messageId,
            messageThreadExternalId: result.messageId,
          },
        );
      } catch (error) {
        await messageRepository.update(messageId, {
          deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
        });
        this.logger.warn(
          `Campaign ${campaignId} failed for ${recipientEmail}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }

      await this.finalizeCampaignIfComplete(workspaceId, campaignId);
    }, buildSystemAuthContext(workspaceId));
  }

  // Correlates an SES bounce/complaint (by the send's message id) to the
  // campaign message and records BOUNCED/COMPLAINED, then refreshes the campaign
  // counts. No-op when the id doesn't match a campaign send.
  async recordDeliveryFailureByProviderMessageId({
    workspaceId,
    providerMessageId,
    deliveryStatus,
  }: {
    workspaceId: string;
    providerMessageId: string;
    deliveryStatus: string;
  }): Promise<void> {
    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          MessageWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      const message = await messageRepository.findOne({
        where: { headerMessageId: providerMessageId },
      });

      if (message === null || message.messageCampaignId === null) {
        return;
      }

      await messageRepository.update(message.id, { deliveryStatus });

      const counts = await this.computeCampaignCounts(
        workspaceId,
        message.messageCampaignId,
      );

      const campaignRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          MessageCampaignWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      await campaignRepository.update(message.messageCampaignId, counts);
    }, buildSystemAuthContext(workspaceId));
  }

  // Materializes one outbound campaign message (QUEUED) + its thread, channel
  // association and from/to participants, with the recipient's personId set
  // directly (no participant matching, no contact auto-creation). Returns the
  // message id. Must run inside an active workspace context.
  private async materializeCampaignMessage({
    workspaceId,
    campaignId,
    messageChannelId,
    fromAddress,
    recipient,
    subject,
    text,
  }: {
    workspaceId: string;
    campaignId: string;
    messageChannelId: string;
    fromAddress: string;
    recipient: CampaignRecipient;
    subject: string;
    text: string;
  }): Promise<string> {
    const messageThreadRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        MessageThreadWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );
    const messageRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        MessageWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );
    const associationRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        MessageChannelMessageAssociationWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );
    const participantRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        MessageParticipantWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

    const threadId = v4();
    const messageId = v4();
    // Temporary identifier; the send job overwrites it with the SES id so the
    // stored ids match what the recipient receives (reply-threading).
    const temporaryExternalId = v4();

    await messageThreadRepository.insert({ id: threadId });

    await messageRepository.insert({
      id: messageId,
      headerMessageId: temporaryExternalId,
      subject,
      text,
      receivedAt: new Date(),
      messageThreadId: threadId,
      messageCampaignId: campaignId,
      deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.QUEUED,
    });

    await associationRepository.insert({
      id: v4(),
      messageId,
      messageChannelId,
      messageExternalId: temporaryExternalId,
      messageThreadExternalId: temporaryExternalId,
      direction: MessageDirection.OUTGOING,
    });

    await participantRepository.insert([
      {
        id: v4(),
        messageId,
        role: MessageParticipantRole.FROM,
        handle: fromAddress,
        displayName: fromAddress,
      },
      {
        id: v4(),
        messageId,
        role: MessageParticipantRole.TO,
        handle: recipient.email,
        displayName: recipient.email,
        personId: recipient.personId,
      },
    ]);

    return messageId;
  }

  // Derives the campaign counts from its messages and finalizes it once nothing
  // remains QUEUED. The status='SENDING' guard makes this a compare-and-swap so
  // concurrent jobs finalize exactly once. Must run inside a workspace context.
  private async finalizeCampaignIfComplete(
    workspaceId: string,
    campaignId: string,
  ): Promise<void> {
    const messageRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        MessageWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

    const queuedCount = await messageRepository.count({
      where: {
        messageCampaignId: campaignId,
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.QUEUED,
      },
    });

    if (queuedCount > 0) {
      return;
    }

    const counts = await this.computeCampaignCounts(workspaceId, campaignId);

    const campaignRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        MessageCampaignWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

    await campaignRepository.update(
      { id: campaignId, status: CAMPAIGN_STATUS.SENDING },
      {
        status: CAMPAIGN_STATUS.SENT,
        sentAt: new Date(),
        ...counts,
      },
    );
  }

  // Counts a campaign's per-recipient outcomes from its messages.
  private async computeCampaignCounts(
    workspaceId: string,
    campaignId: string,
  ): Promise<{ sentCount: number; failedCount: number; bouncedCount: number }> {
    const messageRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        MessageWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

    const sentCount = await messageRepository.count({
      where: {
        messageCampaignId: campaignId,
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT,
      },
    });
    const failedCount = await messageRepository.count({
      where: {
        messageCampaignId: campaignId,
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
      },
    });
    const bouncedCount = await messageRepository.count({
      where: {
        messageCampaignId: campaignId,
        deliveryStatus: In([
          CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED,
          CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED,
        ]),
      },
    });

    return { sentCount, failedCount, bouncedCount };
  }

  // Resolves the recipients of a campaign from a saved Person view (list):
  // the view's filters are run server-side to produce the list of people.
  private async resolveRecipientsFromView(
    workspaceId: string,
    recipientViewId: string,
  ): Promise<RawCampaignRecipient[]> {
    const viewQueryParamsService = this.moduleRef.get(ViewQueryParamsService, {
      strict: false,
    });
    const findRecordsService = this.moduleRef.get(FindRecordsService, {
      strict: false,
    });

    const viewParams = await viewQueryParamsService.resolveViewToQueryParams(
      recipientViewId,
      workspaceId,
    );

    if (viewParams.objectNameSingular !== PERSON_OBJECT_NAME) {
      throw new Error(
        `Recipient view must target ${PERSON_OBJECT_NAME} records, got ${viewParams.objectNameSingular}`,
      );
    }

    const output = await findRecordsService.execute({
      objectName: PERSON_OBJECT_NAME,
      filter: viewParams.filter,
      authContext: buildSystemAuthContext(workspaceId),
    });

    if (!output.success || !output.result) {
      return [];
    }

    const records = output.result.records as Array<{
      id: string;
      emails?: { primaryEmail?: string | null };
    }>;

    return records.map((record) => ({
      personId: record.id,
      email: record.emails?.primaryEmail ?? null,
    }));
  }

  // Resolves the recipients of a campaign from a list's hand-picked members.
  private async resolveRecipientsFromList(
    workspaceId: string,
    listId: string,
  ): Promise<RawCampaignRecipient[]> {
    const listMemberRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        MessageListMemberWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

    const members = await listMemberRepository.find({
      where: { listId },
    });

    return this.loadRecipientsByPersonIds(
      workspaceId,
      members.map((member) => member.personId),
    );
  }

  private async resolveSubscribedRecipients(
    workspaceId: string,
    messageTopicId: string,
  ): Promise<RawCampaignRecipient[]> {
    const subscriptionRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        MessageTopicSubscriptionWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

    const subscriptions = await subscriptionRepository.find({
      where: { topicId: messageTopicId, status: SUBSCRIBED_STATUS },
    });

    return this.loadRecipientsByPersonIds(
      workspaceId,
      subscriptions.map((subscription) => subscription.personId),
    );
  }

  private async loadRecipientsByPersonIds(
    workspaceId: string,
    personIds: string[],
  ): Promise<RawCampaignRecipient[]> {
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

    return people.map((person) => ({
      personId: person.id,
      email: person.emails?.primaryEmail ?? null,
    }));
  }
}
