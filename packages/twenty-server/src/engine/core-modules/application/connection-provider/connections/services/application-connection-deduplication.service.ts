import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager, IsNull, Not, Repository } from 'typeorm';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { isConnectionHiddenFromRequestUser } from 'src/engine/core-modules/application/connection-provider/connections/utils/is-connection-hidden-from-request-user.util';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { isUniqueViolationError } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-unique-violation-error.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

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
  wasMerged: boolean;
};

type IdentifiableConnectedAccount = ConnectedAccountEntity & {
  connectionProviderId: string;
};

@Injectable()
export class ApplicationConnectionDeduplicationService {
  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectWorkspaceScopedRepository(ConnectionProviderEntity)
    private readonly connectionProviderRepository: WorkspaceScopedRepository<ConnectionProviderEntity>,
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

      // A concurrent call stored the same id first and has committed; the retry finds that row and merges into it.
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

        const identifiableTarget: IdentifiableConnectedAccount = {
          ...target,
          connectionProviderId: target.connectionProviderId,
        };

        if (target.externalAccountId === externalAccountId) {
          if (isDefined(handle) && handle !== target.handle) {
            await entityManager.update(
              ConnectedAccountEntity,
              { id: target.id, workspaceId },
              { handle },
            );
          }

          return { connectedAccountId: target.id, wasMerged: false };
        }

        const existing = await this.findActiveConnectionForAccount({
          entityManager,
          target: identifiableTarget,
          externalAccountId,
        });

        if (isDefined(target.externalAccountId)) {
          return this.moveCredentialsToReconnectedAccount({
            entityManager,
            target: identifiableTarget,
            existing,
            externalAccountId,
            handle,
          });
        }

        if (!isDefined(existing)) {
          await entityManager.update(
            ConnectedAccountEntity,
            { id: target.id, workspaceId },
            { externalAccountId, ...(isDefined(handle) ? { handle } : {}) },
          );

          return { connectedAccountId: target.id, wasMerged: false };
        }

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

        return { connectedAccountId: existing.id, wasMerged: true };
      },
    );
  }

  // The target's tokens now belong to externalAccountId, not to the account the row was identified as.
  private async moveCredentialsToReconnectedAccount({
    entityManager,
    target,
    existing,
    externalAccountId,
    handle,
  }: {
    entityManager: EntityManager;
    target: IdentifiableConnectedAccount;
    existing: ConnectedAccountEntity | null;
    externalAccountId: string;
    handle: string | null;
  }): Promise<DeduplicateConnectionResult> {
    let survivorId: string;

    if (isDefined(existing)) {
      await this.copyCredentials({
        entityManager,
        source: target,
        destination: existing,
        handle,
      });
      survivorId = existing.id;
    } else {
      const created = await this.createConnectionForAccount({
        entityManager,
        target,
        externalAccountId,
        handle,
      });

      survivorId = created.id;
    }

    const now = new Date();

    await entityManager.update(
      ConnectedAccountEntity,
      { id: target.id, workspaceId: target.workspaceId },
      {
        accessToken: null,
        refreshToken: null,
        lastCredentialsRefreshedAt: now,
        authFailedAt: now,
        authFailedReason: this.i18nService
          .getI18nInstance(SOURCE_LOCALE)
          ._(msg`Reconnected with a different account`),
      },
    );

    return { connectedAccountId: survivorId, wasMerged: isDefined(existing) };
  }

  private async findActiveConnectionForAccount({
    entityManager,
    target,
    externalAccountId,
  }: {
    entityManager: EntityManager;
    target: IdentifiableConnectedAccount;
    externalAccountId: string;
  }): Promise<ConnectedAccountEntity | null> {
    return entityManager.findOne(ConnectedAccountEntity, {
      where: {
        id: Not(target.id),
        workspaceId: target.workspaceId,
        connectionProviderId: target.connectionProviderId,
        provider: ConnectedAccountProvider.APP,
        externalAccountId,
        visibility: target.visibility,
        ...(target.visibility === 'user'
          ? { userWorkspaceId: target.userWorkspaceId }
          : {}),
        archivedAt: IsNull(),
      },
      lock: { mode: 'pessimistic_write' },
    });
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

  private async createConnectionForAccount({
    entityManager,
    target,
    externalAccountId,
    handle,
  }: {
    entityManager: EntityManager;
    target: IdentifiableConnectedAccount;
    externalAccountId: string;
    handle: string | null;
  }): Promise<ConnectedAccountEntity> {
    const provider = await this.connectionProviderRepository
      .withManager(entityManager)
      .findOne(target.workspaceId, {
        where: { id: target.connectionProviderId },
      });

    if (!isDefined(provider)) {
      throw new ConnectionProviderException(
        `Connection provider ${target.connectionProviderId} not found`,
        ConnectionProviderExceptionCode.CONNECTION_PROVIDER_NOT_FOUND,
      );
    }

    const repository = entityManager.getRepository(ConnectedAccountEntity);
    const existingCount = await repository.count({
      where: {
        connectionProviderId: target.connectionProviderId,
        workspaceId: target.workspaceId,
      },
    });

    return repository.save(
      repository.create({
        name: `${provider.displayName} #${existingCount + 1}`,
        handle: handle ?? target.handle,
        provider: ConnectedAccountProvider.APP,
        workspaceId: target.workspaceId,
        applicationId: target.applicationId,
        connectionProviderId: target.connectionProviderId,
        userWorkspaceId: target.userWorkspaceId,
        visibility: target.visibility,
        externalAccountId,
        accessToken: target.accessToken,
        refreshToken: target.refreshToken,
        scopes: target.scopes,
        lastCredentialsRefreshedAt: new Date(),
      }),
    );
  }
}
