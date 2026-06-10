import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { MessageSuppressionService } from 'src/engine/core-modules/emailing-domain/services/message-suppression.service';
import { MessageTopicSubscriptionSource } from 'src/engine/core-modules/emailing-domain/types/message-topic-subscription-source.type';
import { MessageTopicSubscriptionStatus } from 'src/engine/core-modules/emailing-domain/types/message-topic-subscription-status.type';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';
import { type SubscribedTopic } from 'src/engine/core-modules/emailing-domain/types/subscribed-topic.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageTopicSubscriptionWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-topic-subscription.workspace-entity';
import { MessageTopicWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-topic.workspace-entity';
import { addPersonEmailFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-email-filters-to-query-builder';
import { findPersonByPrimaryOrAdditionalEmail } from 'src/modules/match-participant/utils/find-person-by-primary-or-additional-email';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

type SubscribeArgs = {
  workspaceId: string;
  personId: string;
  topicId: string;
  source?: MessageTopicSubscriptionSource;
};

type UnsubscribeArgs = {
  workspaceId: string;
  personId: string;
  topicId: string;
};

type UnsubscribeByEmailArgs = {
  workspaceId: string;
  emailAddress: string;
  topicId: string;
};

type SubscribedTopicsArgs = {
  workspaceId: string;
  emailAddress: string;
};

type SetSubscribedTopicsArgs = {
  workspaceId: string;
  emailAddress: string;
  subscribedTopicIds: string[];
};

type UpsertSubscriptionStatusArgs = {
  workspaceId: string;
  personId: string;
  topicId: string;
  status: MessageTopicSubscriptionStatus;
  source: MessageTopicSubscriptionSource;
};

@Injectable()
export class MessageTopicSubscriptionService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messageSuppressionService: MessageSuppressionService,
  ) {}

  async subscribe({
    workspaceId,
    personId,
    topicId,
    source = MessageTopicSubscriptionSource.MANUAL,
  }: SubscribeArgs): Promise<void> {
    await this.upsertSubscriptionStatus({
      workspaceId,
      personId,
      topicId,
      status: MessageTopicSubscriptionStatus.SUBSCRIBED,
      source,
    });

    const emailAddress = await this.resolvePrimaryEmailByPersonId(
      workspaceId,
      personId,
    );

    if (isDefined(emailAddress)) {
      await this.messageSuppressionService.removeTopicSuppression(
        workspaceId,
        emailAddress,
        topicId,
      );
    }
  }

  async unsubscribe({
    workspaceId,
    personId,
    topicId,
  }: UnsubscribeArgs): Promise<void> {
    const emailAddress = await this.resolvePrimaryEmailByPersonId(
      workspaceId,
      personId,
    );

    if (isDefined(emailAddress)) {
      await this.messageSuppressionService.suppress({
        workspaceId,
        emailAddress,
        reason: MessageSuppressionReason.UNSUBSCRIBE,
        source: MessageSuppressionSource.SYSTEM,
        topicId,
      });
    }

    await this.deleteSubscription({ workspaceId, personId, topicId });
  }

  async unsubscribeByEmail({
    workspaceId,
    emailAddress,
    topicId,
  }: UnsubscribeByEmailArgs): Promise<boolean> {
    const personId = await this.resolvePersonIdByEmail(
      workspaceId,
      emailAddress,
    );

    if (!isDefined(personId)) {
      return false;
    }

    await this.unsubscribe({ workspaceId, personId, topicId });

    return true;
  }

  async getSubscribedTopics({
    workspaceId,
    emailAddress,
  }: SubscribedTopicsArgs): Promise<SubscribedTopic[]> {
    const personId = await this.resolvePersonIdByEmail(
      workspaceId,
      emailAddress,
    );

    if (!isDefined(personId)) {
      return [];
    }

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const subscriptionRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            MessageTopicSubscriptionWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const subscriptions = await subscriptionRepository.find({
          where: {
            personId,
            status: MessageTopicSubscriptionStatus.SUBSCRIBED,
          },
        });

        if (!isNonEmptyArray(subscriptions)) {
          return [];
        }

        const topicRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            MessageTopicWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const topics = await topicRepository.find({
          where: {
            id: In(subscriptions.map((subscription) => subscription.topicId)),
          },
        });

        const topicNameById = new Map(
          topics.map((topic) => [topic.id, topic.name]),
        );

        return subscriptions.map((subscription) => ({
          topicId: subscription.topicId,
          topicName:
            topicNameById.get(subscription.topicId) ?? subscription.topicName,
        }));
      },
      buildSystemAuthContext(workspaceId),
    );
  }

  // Public preference page can only narrow delivery: topics outside the
  // current subscribed set are ignored, never newly subscribed.
  async setSubscribedTopics({
    workspaceId,
    emailAddress,
    subscribedTopicIds,
  }: SetSubscribedTopicsArgs): Promise<boolean> {
    const personId = await this.resolvePersonIdByEmail(
      workspaceId,
      emailAddress,
    );

    if (!isDefined(personId)) {
      return false;
    }

    const keptTopicIds = new Set(subscribedTopicIds);

    const currentlySubscribedTopics = await this.getSubscribedTopics({
      workspaceId,
      emailAddress,
    });

    const topicIdsToUnsubscribe = currentlySubscribedTopics
      .map((topic) => topic.topicId)
      .filter((topicId) => !keptTopicIds.has(topicId));

    for (const topicId of topicIdsToUnsubscribe) {
      await this.unsubscribe({ workspaceId, personId, topicId });
    }

    return true;
  }

  private async resolvePersonIdByEmail(
    workspaceId: string,
    emailAddress: string,
  ): Promise<string | undefined> {
    const normalizedAddress = emailAddress.trim().toLowerCase();

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const personRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            PersonWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const matchedPeople = await addPersonEmailFiltersToQueryBuilder({
          queryBuilder: personRepository.createQueryBuilder('person'),
          emails: [normalizedAddress],
        }).getMany();

        return findPersonByPrimaryOrAdditionalEmail({
          people: matchedPeople,
          email: normalizedAddress,
        })?.id;
      },
      buildSystemAuthContext(workspaceId),
    );
  }

  async getAddressesUnsubscribedFromList(
    workspaceId: string,
    emailAddresses: string[],
    topicId: string,
  ): Promise<Set<string>> {
    return this.messageSuppressionService.getTopicSuppressedAddresses(
      workspaceId,
      emailAddresses,
      topicId,
    );
  }

  private async deleteSubscription({
    workspaceId,
    personId,
    topicId,
  }: UnsubscribeArgs): Promise<void> {
    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const subscriptionRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          MessageTopicSubscriptionWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      const existingSubscription = await subscriptionRepository.findOneBy({
        personId,
        topicId,
      });

      if (isDefined(existingSubscription)) {
        await subscriptionRepository.delete(existingSubscription.id);
      }
    }, buildSystemAuthContext(workspaceId));
  }

  private async resolvePrimaryEmailByPersonId(
    workspaceId: string,
    personId: string,
  ): Promise<string | undefined> {
    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const personRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            PersonWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const person = await personRepository.findOneBy({ id: personId });

        return person?.emails?.primaryEmail ?? undefined;
      },
      buildSystemAuthContext(workspaceId),
    );
  }

  private async upsertSubscriptionStatus({
    workspaceId,
    personId,
    topicId,
    status,
    source,
  }: UpsertSubscriptionStatusArgs): Promise<void> {
    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const subscriptionRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          MessageTopicSubscriptionWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      const existingSubscription = await subscriptionRepository.findOneBy({
        personId,
        topicId,
      });

      const now = new Date();
      const statusChangeTimestamp =
        status === MessageTopicSubscriptionStatus.SUBSCRIBED
          ? { subscribedAt: now }
          : { unsubscribedAt: now };

      if (isDefined(existingSubscription)) {
        await subscriptionRepository.update(existingSubscription.id, {
          status,
          ...statusChangeTimestamp,
        });

        return;
      }

      const topicRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          MessageTopicWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );
      const topic = await topicRepository.findOneBy({ id: topicId });

      await subscriptionRepository.insert({
        personId,
        topicId,
        topicName: topic?.name ?? null,
        status,
        source,
        ...statusChangeTimestamp,
      });
    }, buildSystemAuthContext(workspaceId));
  }
}
