import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, MoreThan, Not, Raw, type Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

const LOOKUP_BATCH_SIZE = 50;

@Injectable()
export class ApplicationRegistrationInstallationService {
  constructor(
    // oxlint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    // oxlint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  async forEachBatch({
    applicationRegistrationId,
    healthChecksOnly = false,
    processBatch,
  }: {
    applicationRegistrationId: string;
    healthChecksOnly?: boolean;
    processBatch: (applications: ApplicationEntity[]) => Promise<void>;
  }): Promise<void> {
    let cursor: string | undefined;
    let batchSize: number;

    do {
      const applications = await this.applicationRepository.find({
        select: {
          id: true,
          workspaceId: true,
          version: healthChecksOnly,
          healthCheckLogicFunctionId: healthChecksOnly,
          billing: !healthChecksOnly,
        },
        where: {
          applicationRegistrationId,
          // A relation join makes TypeORM issue a second pagination query.
          workspaceId: Raw(
            (workspaceId) =>
              `EXISTS (SELECT 1 FROM core.workspace workspace WHERE workspace.id = ${workspaceId} AND workspace."deletedAt" IS NULL)`,
          ),
          ...(isDefined(cursor) ? { id: MoreThan(cursor) } : {}),
          ...(healthChecksOnly
            ? { healthCheckLogicFunctionId: Not(IsNull()) }
            : {}),
        },
        order: { id: 'ASC' },
        take: LOOKUP_BATCH_SIZE,
      });

      batchSize = applications.length;

      if (batchSize === 0) {
        return;
      }

      await processBatch(applications);
      cursor = applications[batchSize - 1].id;
    } while (batchSize === LOOKUP_BATCH_SIZE);
  }

  async getReconnectionIdentities(applications: ApplicationEntity[]) {
    const connections = await this.connectedAccountRepository.find({
      select: { applicationId: true, workspaceId: true },
      where: {
        applicationId: In(applications.map(({ id }) => id)),
        archivedAt: IsNull(),
        authFailedAt: Not(IsNull()),
      },
    });

    return new Set(
      connections.map(
        ({ applicationId, workspaceId }) => `${workspaceId}:${applicationId}`,
      ),
    );
  }
}
