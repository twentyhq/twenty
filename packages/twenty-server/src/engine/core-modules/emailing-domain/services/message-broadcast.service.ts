import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { isNonEmptyString } from '@sniptt/guards';
import { In } from 'typeorm';

import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { EmailingDomainSenderService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain-sender.service';
import { EmailGroupMessageCategory } from 'src/engine/core-modules/emailing-domain/types/email-group-message-category.type';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { ViewQueryParamsService } from 'src/engine/metadata-modules/view/services/view-query-params.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageBroadcastWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-broadcast.workspace-entity';
import { MessageSubscriptionWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-subscription.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { createHtmlToTextConverter } from 'src/modules/messaging/message-import-manager/utils/create-html-to-text-converter.util';

type SendBroadcastArgs = {
  workspaceId: string;
  messageTopicId: string;
  subject: string;
  html: string;
  fromAddress: string;
  // When set, recipients come from this Person view's filters (a segment).
  // Otherwise recipients are the people subscribed to the topic.
  recipientViewId?: string;
};

type SendBroadcastResult = {
  broadcastId: string;
  sentCount: number;
  failedCount: number;
};

const SUBSCRIBED_STATUS = 'SUBSCRIBED';
const PERSON_OBJECT_NAME = 'person';

@Injectable()
export class MessageBroadcastService {
  private readonly logger = new Logger(MessageBroadcastService.name);
  private readonly htmlToText = createHtmlToTextConverter();

  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly emailingDomainSenderService: EmailingDomainSenderService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    // Resolved lazily to avoid a module-load cycle: the record-crud/view
    // graph (CoreCommonApiModule) cannot be eagerly imported from this
    // early-loaded core module without a require-time TDZ.
    private readonly moduleRef: ModuleRef,
  ) {}

  async send({
    workspaceId,
    messageTopicId,
    subject,
    html,
    fromAddress,
    recipientViewId,
  }: SendBroadcastArgs): Promise<SendBroadcastResult> {
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

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const recipientEmails = isNonEmptyString(recipientViewId)
          ? await this.resolveRecipientsFromView(workspaceId, recipientViewId)
          : await this.resolveSubscribedEmails(workspaceId, messageTopicId);

        const broadcastRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            MessageBroadcastWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const { identifiers } = await broadcastRepository.insert({
          name: subject,
          subject,
          bodyTemplate: html,
          fromAddress,
          status: 'SENDING',
          recipientSource: isNonEmptyString(recipientViewId)
            ? 'FILTER'
            : 'LIST',
          recipientViewId: recipientViewId ?? null,
          topicId: messageTopicId,
        });
        const broadcastId = identifiers[0].id;

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
                messageTopicId,
              },
            );
            sentCount += 1;
          } catch (error) {
            failedCount += 1;
            this.logger.warn(
              `Broadcast ${broadcastId} skipped ${recipientEmail}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
          }
        }

        await broadcastRepository.update(broadcastId, {
          status: 'SENT',
          sentAt: new Date(),
          sentCount,
          failedCount,
        });

        return { broadcastId, sentCount, failedCount };
      },
      buildSystemAuthContext(workspaceId),
    );
  }

  // Resolves the recipients of a broadcast from a saved Person view (segment):
  // the view's filters are run server-side to produce the list of people.
  private async resolveRecipientsFromView(
    workspaceId: string,
    recipientViewId: string,
  ): Promise<string[]> {
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
      emails?: { primaryEmail?: string | null };
    }>;

    return records
      .map((record) => record.emails?.primaryEmail)
      .filter((email): email is string => isNonEmptyString(email));
  }

  private async resolveSubscribedEmails(
    workspaceId: string,
    messageTopicId: string,
  ): Promise<string[]> {
    const subscriptionRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        MessageSubscriptionWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

    const subscriptions = await subscriptionRepository.find({
      where: { topicId: messageTopicId, status: SUBSCRIBED_STATUS },
    });

    const personIds = subscriptions.map(
      (subscription) => subscription.personId,
    );

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
