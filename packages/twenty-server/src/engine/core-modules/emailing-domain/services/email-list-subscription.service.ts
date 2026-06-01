import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { EmailListSubscriptionSource } from 'src/engine/core-modules/emailing-domain/types/email-list-subscription-source.type';
import { EmailListSubscriptionStatus } from 'src/engine/core-modules/emailing-domain/types/email-list-subscription-status.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { EmailListSubscriptionWorkspaceEntity } from 'src/modules/emailing/standard-objects/email-list-subscription.workspace-entity';
import { addPersonEmailFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-email-filters-to-query-builder';
import { findPersonByPrimaryOrAdditionalEmail } from 'src/modules/match-participant/utils/find-person-by-primary-or-additional-email';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

type SubscribeArgs = {
  workspaceId: string;
  personId: string;
  listId: string;
  source?: EmailListSubscriptionSource;
};

type UnsubscribeArgs = {
  workspaceId: string;
  personId: string;
  listId: string;
};

type UnsubscribeByEmailArgs = {
  workspaceId: string;
  emailAddress: string;
  listId: string;
};

type UpsertSubscriptionStatusArgs = {
  workspaceId: string;
  personId: string;
  listId: string;
  status: EmailListSubscriptionStatus;
  source: EmailListSubscriptionSource;
};

@Injectable()
export class EmailListSubscriptionService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async subscribe({
    workspaceId,
    personId,
    listId,
    source = EmailListSubscriptionSource.MANUAL,
  }: SubscribeArgs): Promise<void> {
    await this.upsertSubscriptionStatus({
      workspaceId,
      personId,
      listId,
      status: EmailListSubscriptionStatus.SUBSCRIBED,
      source,
    });
  }

  async unsubscribe({
    workspaceId,
    personId,
    listId,
  }: UnsubscribeArgs): Promise<void> {
    await this.upsertSubscriptionStatus({
      workspaceId,
      personId,
      listId,
      status: EmailListSubscriptionStatus.UNSUBSCRIBED,
      source: EmailListSubscriptionSource.MANUAL,
    });
  }

  async unsubscribeByEmail({
    workspaceId,
    emailAddress,
    listId,
  }: UnsubscribeByEmailArgs): Promise<boolean> {
    const personId = await this.resolvePersonIdByEmail(
      workspaceId,
      emailAddress,
    );

    if (!isDefined(personId)) {
      return false;
    }

    await this.unsubscribe({ workspaceId, personId, listId });

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
    listId: string,
  ): Promise<Set<string>> {
    const normalizedAddresses = [
      ...new Set(
        emailAddresses.map((emailAddress) => emailAddress.trim().toLowerCase()),
      ),
    ];

    if (!isNonEmptyArray(normalizedAddresses)) {
      return new Set();
    }

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
          emails: normalizedAddresses,
        }).getMany();

        if (!isNonEmptyArray(matchedPeople)) {
          return new Set();
        }

        const subscriptionRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            EmailListSubscriptionWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const unsubscribedSubscriptions = await subscriptionRepository.find({
          where: {
            listId,
            personId: In(matchedPeople.map((person) => person.id)),
            status: EmailListSubscriptionStatus.UNSUBSCRIBED,
          },
        });

        const unsubscribedPersonIds = new Set(
          unsubscribedSubscriptions.map(
            (subscription) => subscription.personId,
          ),
        );

        const unsubscribedAddresses = new Set<string>();

        for (const emailAddress of normalizedAddresses) {
          const matchedPerson = findPersonByPrimaryOrAdditionalEmail({
            people: matchedPeople,
            email: emailAddress,
          });

          if (
            isDefined(matchedPerson) &&
            unsubscribedPersonIds.has(matchedPerson.id)
          ) {
            unsubscribedAddresses.add(emailAddress);
          }
        }

        return unsubscribedAddresses;
      },
      buildSystemAuthContext(workspaceId),
    );
  }

  private async upsertSubscriptionStatus({
    workspaceId,
    personId,
    listId,
    status,
    source,
  }: UpsertSubscriptionStatusArgs): Promise<void> {
    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const subscriptionRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          EmailListSubscriptionWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      const existingSubscription = await subscriptionRepository.findOneBy({
        personId,
        listId,
      });

      const now = new Date();
      const statusChangeTimestamp =
        status === EmailListSubscriptionStatus.SUBSCRIBED
          ? { subscribedAt: now }
          : { unsubscribedAt: now };

      if (isDefined(existingSubscription)) {
        await subscriptionRepository.update(existingSubscription.id, {
          status,
          ...statusChangeTimestamp,
        });

        return;
      }

      await subscriptionRepository.insert({
        personId,
        listId,
        status,
        source,
        ...statusChangeTimestamp,
      });
    }, buildSystemAuthContext(workspaceId));
  }
}
