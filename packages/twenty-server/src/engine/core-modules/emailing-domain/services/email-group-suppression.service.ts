import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { FieldActorSource } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { BLOCKED_SCOPES_BY_SEND_TYPE } from 'src/engine/core-modules/emailing-domain/constants/blocked-scopes-by-send-type.constant';
import { SUPPRESSION_SCOPE_BY_REASON } from 'src/engine/core-modules/emailing-domain/constants/suppression-scope-by-reason.constant';
import { EmailGroupSuppressedRecipientEntity } from 'src/engine/core-modules/emailing-domain/email-group-suppressed-recipient.entity';
import { EmailGroupSendType } from 'src/engine/core-modules/emailing-domain/types/email-group-send-type.type';
import { EmailGroupSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/email-group-suppression-reason.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type SuppressRecipientArgs = {
  workspaceId: string;
  emailAddress: string;
  reason: EmailGroupSuppressionReason;
  createdBySource: FieldActorSource;
  providerEventId?: string | null;
};

@Injectable()
export class EmailGroupSuppressionService {
  constructor(
    @InjectWorkspaceScopedRepository(EmailGroupSuppressedRecipientEntity)
    private readonly suppressedRecipientRepository: WorkspaceScopedRepository<EmailGroupSuppressedRecipientEntity>,
  ) {}

  async getSuppressedAddresses(
    workspaceId: string,
    emailAddresses: string[],
    sendType: EmailGroupSendType,
  ): Promise<Set<string>> {
    const normalizedAddresses = [
      ...new Set(
        emailAddresses.map((emailAddress) => emailAddress.trim().toLowerCase()),
      ),
    ];

    if (!isNonEmptyArray(normalizedAddresses)) {
      return new Set();
    }

    const suppressedRecipients = await this.suppressedRecipientRepository.find(
      workspaceId,
      {
        where: {
          emailAddress: In(normalizedAddresses),
          scope: In(BLOCKED_SCOPES_BY_SEND_TYPE[sendType]),
          isSuppressed: true,
        },
      },
    );

    return new Set(
      suppressedRecipients.map((recipient) => recipient.emailAddress),
    );
  }

  async suppress({
    workspaceId,
    emailAddress,
    reason,
    createdBySource,
    providerEventId = null,
  }: SuppressRecipientArgs): Promise<void> {
    const normalizedEmailAddress = emailAddress.trim().toLowerCase();

    if (!isNonEmptyString(normalizedEmailAddress)) {
      return;
    }

    await this.suppressedRecipientRepository.upsert(
      workspaceId,
      {
        emailAddress: normalizedEmailAddress,
        scope: SUPPRESSION_SCOPE_BY_REASON[reason],
        reason,
        isSuppressed: true,
        createdBySource,
        providerEventId,
      },
      ['workspaceId', 'emailAddress', 'scope'],
    );
  }
}
