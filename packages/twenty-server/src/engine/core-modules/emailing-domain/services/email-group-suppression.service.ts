import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from '@sniptt/guards';
import { FieldActorSource } from 'twenty-shared/types';
import { In } from 'typeorm';

import { EmailGroupSuppressedRecipientEntity } from 'src/engine/core-modules/emailing-domain/email-group-suppressed-recipient.entity';
import { EmailGroupSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/email-group-suppression-reason.type';
import { EmailGroupSuppressionScope } from 'src/engine/core-modules/emailing-domain/types/email-group-suppression-scope.type';
import { EmailGroupSuppressionStatus } from 'src/engine/core-modules/emailing-domain/types/email-group-suppression-status.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const REVERSIBLE_REASONS: ReadonlySet<EmailGroupSuppressionReason> = new Set([
  EmailGroupSuppressionReason.UNSUBSCRIBE,
]);

@Injectable()
export class EmailGroupSuppressionService {
  constructor(
    @InjectWorkspaceScopedRepository(EmailGroupSuppressedRecipientEntity)
    private readonly suppressedRecipientRepository: WorkspaceScopedRepository<EmailGroupSuppressedRecipientEntity>,
  ) {}

  async getSuppressedAddresses(
    workspaceId: string,
    emailAddresses: string[],
  ): Promise<Set<string>> {
    const normalizedAddresses = [
      ...new Set(emailAddresses.map(normalizeEmailAddress)),
    ];

    if (!isNonEmptyArray(normalizedAddresses)) {
      return new Set();
    }

    const activeSuppressions = await this.suppressedRecipientRepository.find(
      workspaceId,
      {
        where: {
          emailAddress: In(normalizedAddresses),
          status: EmailGroupSuppressionStatus.ACTIVE,
        },
      },
    );

    return new Set(
      activeSuppressions.map((suppression) => suppression.emailAddress),
    );
  }

  async suppress(
    workspaceId: string,
    emailAddress: string,
    reason: EmailGroupSuppressionReason,
    createdBySource: FieldActorSource,
    providerEventId: string | null = null,
  ): Promise<void> {
    await this.suppressedRecipientRepository.upsert(
      workspaceId,
      {
        emailAddress: normalizeEmailAddress(emailAddress),
        scope: scopeForReason(reason),
        reason,
        status: EmailGroupSuppressionStatus.ACTIVE,
        createdBySource,
        providerEventId,
      },
      ['workspaceId', 'emailAddress', 'scope'],
    );
  }

  async releaseMarketingSuppression(
    workspaceId: string,
    emailAddress: string,
  ): Promise<void> {
    await this.suppressedRecipientRepository.update(
      workspaceId,
      {
        emailAddress: normalizeEmailAddress(emailAddress),
        scope: EmailGroupSuppressionScope.MARKETING,
      },
      { status: EmailGroupSuppressionStatus.RELEASED },
    );
  }
}

const scopeForReason = (
  reason: EmailGroupSuppressionReason,
): EmailGroupSuppressionScope =>
  REVERSIBLE_REASONS.has(reason)
    ? EmailGroupSuppressionScope.MARKETING
    : EmailGroupSuppressionScope.GLOBAL;

const normalizeEmailAddress = (emailAddress: string): string =>
  emailAddress.trim().toLowerCase();
