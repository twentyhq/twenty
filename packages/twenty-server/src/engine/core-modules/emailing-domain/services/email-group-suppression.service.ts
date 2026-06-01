import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { BLOCKING_REASONS_BY_MESSAGE_CATEGORY } from 'src/engine/core-modules/emailing-domain/constants/blocking-reasons-by-message-category.constant';
import { EmailGroupMessageCategory } from 'src/engine/core-modules/emailing-domain/types/email-group-message-category.type';
import { EmailGroupSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/email-group-suppression-reason.type';
import { EmailGroupSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/email-group-suppression-source.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { EmailGroupSuppressionListWorkspaceEntity } from 'src/modules/emailing/standard-objects/email-group-suppression-list.workspace-entity';

type SuppressArgs = {
  workspaceId: string;
  emailAddress: string;
  reason: EmailGroupSuppressionReason;
  source: EmailGroupSuppressionSource;
  providerEventId?: string | null;
};

const HARD_SUPPRESSION_REASONS = [
  EmailGroupSuppressionReason.BOUNCE,
  EmailGroupSuppressionReason.COMPLAINT,
];

@Injectable()
export class EmailGroupSuppressionService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async getSuppressedAddresses(
    workspaceId: string,
    emailAddresses: string[],
    messageCategory: EmailGroupMessageCategory,
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
              EmailGroupSuppressionListWorkspaceEntity,
              { shouldBypassPermissionChecks: true },
            );

          return suppressionRepository.find({
            where: {
              emailAddress: In(normalizedAddresses),
              reason: In(BLOCKING_REASONS_BY_MESSAGE_CATEGORY[messageCategory]),
            },
          });
        },
        buildSystemAuthContext(workspaceId),
      );

    return new Set(
      suppressedRecipients.map((recipient) => recipient.emailAddress),
    );
  }

  async suppress({
    workspaceId,
    emailAddress,
    reason,
    source,
    providerEventId = null,
  }: SuppressArgs): Promise<void> {
    const normalizedEmailAddress = emailAddress.trim().toLowerCase();

    if (!isNonEmptyString(normalizedEmailAddress)) {
      return;
    }

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const suppressionRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          EmailGroupSuppressionListWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      const existingSuppression = await suppressionRepository.findOneBy({
        emailAddress: normalizedEmailAddress,
      });

      if (!isDefined(existingSuppression)) {
        await suppressionRepository.insert({
          emailAddress: normalizedEmailAddress,
          reason,
          source,
          providerEventId,
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
    incomingReason: EmailGroupSuppressionReason,
  ): boolean {
    const existingIsHard = HARD_SUPPRESSION_REASONS.some(
      (hardReason) => hardReason === existingReason,
    );
    const incomingIsHard = HARD_SUPPRESSION_REASONS.includes(incomingReason);

    return !existingIsHard && incomingIsHard;
  }
}
