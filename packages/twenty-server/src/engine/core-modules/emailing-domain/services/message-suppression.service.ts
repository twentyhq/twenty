import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, IsNull } from 'typeorm';

import {
  GLOBAL_BLOCKING_SUPPRESSION_REASONS,
  HARD_SUPPRESSION_REASONS,
} from 'src/engine/core-modules/emailing-domain/constants/hard-suppression-reasons.constant';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageSuppressionWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-suppression.workspace-entity';

type SuppressArgs = {
  workspaceId: string;
  emailAddress: string;
  reason: MessageSuppressionReason;
  source: MessageSuppressionSource;
  providerEventId?: string | null;
  topicId?: string | null;
};

@Injectable()
export class MessageSuppressionService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async getSuppressedAddresses(
    workspaceId: string,
    emailAddresses: string[],
  ): Promise<Set<string>> {
    const normalizedAddresses = [
      ...new Set(
        emailAddresses.map((emailAddress) => emailAddress.trim().toLowerCase()),
      ),
    ];

    if (!isNonEmptyArray(normalizedAddresses)) {
      return new Set();
    }

    const suppressedRecipients =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const suppressionRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              MessageSuppressionWorkspaceEntity,
              { shouldBypassPermissionChecks: true },
            );

          return suppressionRepository.find({
            where: {
              emailAddress: { primaryEmail: In(normalizedAddresses) },
              reason: In(GLOBAL_BLOCKING_SUPPRESSION_REASONS),
              topicId: IsNull(),
            },
          });
        },
        buildSystemAuthContext(workspaceId),
      );

    return new Set(
      suppressedRecipients
        .map((recipient) => recipient.emailAddress?.primaryEmail)
        .filter(isNonEmptyString),
    );
  }

  async getTopicSuppressedAddresses(
    workspaceId: string,
    emailAddresses: string[],
    topicId: string,
  ): Promise<Set<string>> {
    const normalizedAddresses = [
      ...new Set(
        emailAddresses.map((emailAddress) => emailAddress.trim().toLowerCase()),
      ),
    ];

    if (!isNonEmptyArray(normalizedAddresses)) {
      return new Set();
    }

    const suppressedRecipients =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const suppressionRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              MessageSuppressionWorkspaceEntity,
              { shouldBypassPermissionChecks: true },
            );

          return suppressionRepository.find({
            where: {
              emailAddress: { primaryEmail: In(normalizedAddresses) },
              reason: MessageSuppressionReason.UNSUBSCRIBE,
              topicId,
            },
          });
        },
        buildSystemAuthContext(workspaceId),
      );

    return new Set(
      suppressedRecipients
        .map((recipient) => recipient.emailAddress?.primaryEmail)
        .filter(isNonEmptyString),
    );
  }

  async suppress({
    workspaceId,
    emailAddress,
    reason,
    source,
    providerEventId = null,
    topicId = null,
  }: SuppressArgs): Promise<void> {
    const normalizedEmailAddress = emailAddress.trim().toLowerCase();

    if (!isNonEmptyString(normalizedEmailAddress)) {
      return;
    }

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const suppressionRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          MessageSuppressionWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      const existingSuppression = await suppressionRepository.findOneBy({
        emailAddress: { primaryEmail: normalizedEmailAddress },
        topicId: isDefined(topicId) ? topicId : IsNull(),
      });

      if (!isDefined(existingSuppression)) {
        await suppressionRepository.insert({
          emailAddress: {
            primaryEmail: normalizedEmailAddress,
            additionalEmails: null,
          },
          reason,
          source,
          providerEventId,
          topicId,
        });

        return;
      }

      if (this.shouldEscalate(existingSuppression.reason, reason)) {
        await suppressionRepository.update(existingSuppression.id, {
          reason,
          source,
          providerEventId,
        });
      }
    }, buildSystemAuthContext(workspaceId));
  }

  private shouldEscalate(
    existingReason: string,
    incomingReason: MessageSuppressionReason,
  ): boolean {
    const existingIsHard = HARD_SUPPRESSION_REASONS.some(
      (hardReason) => hardReason === existingReason,
    );
    const incomingIsHard = HARD_SUPPRESSION_REASONS.includes(incomingReason);

    return !existingIsHard && incomingIsHard;
  }
}
