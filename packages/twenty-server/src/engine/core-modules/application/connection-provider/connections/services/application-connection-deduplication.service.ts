import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager, IsNull, Not, Repository } from 'typeorm';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { JUST_ADDED_CONNECTION_MAX_AGE_MS } from 'src/engine/core-modules/application/connection-provider/connections/constants/just-added-connection-max-age-ms.constant';
import { AppConnectionDeduplicationOutcome } from 'src/engine/core-modules/application/connection-provider/connections/enums/app-connection-deduplication-outcome.enum';
import { isConnectionHiddenFromRequestUser } from 'src/engine/core-modules/application/connection-provider/connections/utils/is-connection-hidden-from-request-user.util';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { isUniqueViolationError } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-unique-violation-error.util';

type DeduplicateConnectionArgs = {
  applicationId: string;
  workspaceId: string;
  requestUserWorkspaceId: string | null;
  connectedAccountId: string;
  externalAccountId: string;
  handle: string | null;
};

type DeduplicateConnectionResult = {
  connectedAccountId: string;
  outcome: AppConnectionDeduplicationOutcome;
};

@Injectable()
export class ApplicationConnectionDeduplicationService {
  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly i18nService: I18nService,
  ) {}

  async deduplicateOrThrow(
    args: DeduplicateConnectionArgs,
  ): Promise<DeduplicateConnectionResult> {
    try {
      return await this.deduplicateInTransaction(args);
    } catch (error) {
      if (!isUniqueViolationError(error)) {
        throw error;
      }

      return this.deduplicateInTransaction(args);
    }
  }

  private async deduplicateInTransaction({
    applicationId,
    workspaceId,
    requestUserWorkspaceId,
    connectedAccountId,
    externalAccountId,
    handle,
  }: DeduplicateConnectionArgs): Promise<DeduplicateConnectionResult> {
    return this.connectedAccountRepository.manager.transaction(
      async (entityManager) => {
        const target = await entityManager.findOne(ConnectedAccountEntity, {
          where: {
            id: connectedAccountId,
            applicationId,
            workspaceId,
            provider: ConnectedAccountProvider.APP,
            archivedAt: IsNull(),
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (
          !isDefined(target) ||
          !isDefined(target.connectionProviderId) ||
          isConnectionHiddenFromRequestUser({
            account: target,
            requestUserWorkspaceId,
          })
        ) {
          throw new ConnectionProviderException(
            `Connection ${connectedAccountId} not found`,
            ConnectionProviderExceptionCode.CONNECTION_NOT_FOUND,
          );
        }

        if (target.externalAccountId === externalAccountId) {
          if (isDefined(handle) && handle !== target.handle) {
            await entityManager.update(
              ConnectedAccountEntity,
              { id: target.id, workspaceId },
              { handle },
            );
          }

          return {
            connectedAccountId: target.id,
            outcome: AppConnectionDeduplicationOutcome.IDENTIFIED,
          };
        }

        if (isDefined(target.externalAccountId)) {
          await this.flagConnection({
            entityManager,
            connection: target,
            reason: msg`Reconnected with a different account`,
          });

          return {
            connectedAccountId: target.id,
            outcome: AppConnectionDeduplicationOutcome.REJECTED,
          };
        }

        const existing = await entityManager.findOne(ConnectedAccountEntity, {
          where: {
            id: Not(target.id),
            workspaceId,
            connectionProviderId: target.connectionProviderId,
            provider: ConnectedAccountProvider.APP,
            externalAccountId,
            archivedAt: IsNull(),
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (!isDefined(existing)) {
          await entityManager.update(
            ConnectedAccountEntity,
            { id: target.id, workspaceId },
            { externalAccountId, ...(isDefined(handle) ? { handle } : {}) },
          );

          return {
            connectedAccountId: target.id,
            outcome: AppConnectionDeduplicationOutcome.IDENTIFIED,
          };
        }

        const isSameLevelAndOwner =
          existing.visibility === target.visibility &&
          (target.visibility === 'workspace' ||
            existing.userWorkspaceId === target.userWorkspaceId);

        if (isSameLevelAndOwner && this.isJustAdded(target)) {
          await this.copyCredentials({
            entityManager,
            source: target,
            destination: existing,
            handle,
          });
          await entityManager.delete(ConnectedAccountEntity, {
            id: target.id,
            workspaceId,
          });

          return {
            connectedAccountId: existing.id,
            outcome: AppConnectionDeduplicationOutcome.MERGED,
          };
        }

        await this.flagConnection({
          entityManager,
          connection: target,
          reason: msg`This account is already connected in this workspace`,
        });

        return {
          connectedAccountId: target.id,
          outcome: AppConnectionDeduplicationOutcome.REJECTED,
        };
      },
    );
  }

  // Any write after the OAuth callback's insert moves updatedAt; the age bound
  // keeps an old connection that was never written to from passing as new.
  private isJustAdded(connection: ConnectedAccountEntity): boolean {
    const createdAt = connection.createdAt.getTime();

    return (
      connection.updatedAt.getTime() === createdAt &&
      Date.now() - createdAt < JUST_ADDED_CONNECTION_MAX_AGE_MS
    );
  }

  private async flagConnection({
    entityManager,
    connection,
    reason,
  }: {
    entityManager: EntityManager;
    connection: ConnectedAccountEntity;
    reason: MessageDescriptor;
  }): Promise<void> {
    const now = new Date();

    await entityManager.update(
      ConnectedAccountEntity,
      { id: connection.id, workspaceId: connection.workspaceId },
      {
        accessToken: null,
        refreshToken: null,
        lastCredentialsRefreshedAt: now,
        authFailedAt: now,
        authFailedReason: this.i18nService
          .getI18nInstance(SOURCE_LOCALE)
          ._(reason),
      },
    );
  }

  private async copyCredentials({
    entityManager,
    source,
    destination,
    handle,
  }: {
    entityManager: EntityManager;
    source: ConnectedAccountEntity;
    destination: ConnectedAccountEntity;
    handle: string | null;
  }): Promise<void> {
    await entityManager.update(
      ConnectedAccountEntity,
      { id: destination.id, workspaceId: destination.workspaceId },
      {
        accessToken: source.accessToken,
        refreshToken: source.refreshToken ?? destination.refreshToken,
        scopes: source.scopes,
        lastCredentialsRefreshedAt: new Date(),
        authFailedAt: null,
        authFailedReason: null,
        ...(isDefined(handle) ? { handle } : {}),
      },
    );
  }
}
