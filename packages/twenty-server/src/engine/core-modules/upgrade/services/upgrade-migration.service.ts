import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';
import {
  In,
  IsNull,
  QueryFailedError,
  type QueryRunner,
  Repository,
} from 'typeorm';

import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import {
  UpgradeMigrationEntity,
  UpgradeMigrationStatus,
} from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import { formatUpgradeErrorForStorage } from 'src/engine/core-modules/upgrade/utils/format-upgrade-error-for-storage.util';
import { extractVersionFromCommandName } from 'src/engine/core-modules/upgrade/utils/extract-version-from-command-name.util';

export type WorkspaceLastAttemptedCommand = {
  workspaceId: string;
  name: string;
  status: UpgradeMigrationStatus;
  executedByVersion: string;
  errorMessage: string | null;
  createdAt: Date;
  isInitial: boolean;
};

export type InstanceCommandAttempt = {
  name: string;
  status: UpgradeMigrationStatus;
  executedByVersion: string;
  errorMessage: string | null;
  createdAt: Date;
};

// Where the instance sits in the upgrade sequence. `blocked` is the first
// instance step that has not completed, and is null once every one has.
export type InstanceUpgradeProgress = {
  lastCompleted: InstanceCommandAttempt | null;
  blocked: { name: string; attempt: InstanceCommandAttempt | null } | null;
};

const UPGRADE_MIGRATION_SAVE_BATCH_SIZE = 1000;
const UPGRADE_MIGRATION_CONFLICT_RETRIES = 5;
const POSTGRES_UNIQUE_VIOLATION = '23505';

const isAttemptConflict = (error: unknown): boolean => {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError = error.driverError as { code?: string } | undefined;

  return driverError?.code === POSTGRES_UNIQUE_VIOLATION;
};

@Injectable()
export class UpgradeMigrationService {
  constructor(
    @InjectRepository(UpgradeMigrationEntity)
    private readonly upgradeMigrationRepository: Repository<UpgradeMigrationEntity>,
    private readonly upgradeSequenceReaderService: UpgradeSequenceReaderService,
  ) {}

  async getInferredVersion(commandName?: string): Promise<string | null> {
    if (isDefined(commandName)) {
      return extractVersionFromCommandName(commandName);
    }

    const migration = await this.getInstanceCommandCursor();

    return isDefined(migration)
      ? extractVersionFromCommandName(migration.name)
      : null;
  }

  async isLastAttemptCompleted({
    name,
    workspaceId,
  }: {
    name: string;
    workspaceId: string | null;
  }): Promise<boolean> {
    const latestAttempt = await this.upgradeMigrationRepository.findOne({
      where: {
        name,
        workspaceId: workspaceId === null ? IsNull() : workspaceId,
      },
      order: { attempt: 'DESC' },
    });

    return isDefined(latestAttempt) && latestAttempt.status === 'completed';
  }

  async recordUpgradeMigration(
    params:
      | {
          name: string;
          workspaceIds: string[];
          isInstance: boolean;
          status: 'completed';
          executedByVersion: string;
          queryRunner?: QueryRunner;
        }
      | {
          name: string;
          workspaceIds: string[];
          isInstance: boolean;
          status: 'failed';
          executedByVersion: string;
          error: unknown;
          queryRunner?: QueryRunner;
        },
  ): Promise<void> {
    const { name, workspaceIds, isInstance, status, executedByVersion } =
      params;

    const errorMessage =
      params.status === 'failed'
        ? formatUpgradeErrorForStorage(params.error)
        : null;

    const insertArgs = {
      name,
      workspaceIds,
      isInstance,
      status,
      executedByVersion,
      errorMessage,
    };

    // A caller that supplies a query runner owns the transaction, so a conflict
    // has to surface: retrying inside its aborted transaction cannot succeed.
    if (isDefined(params.queryRunner)) {
      await this.insertAttempts({
        repository: params.queryRunner.manager.getRepository(
          UpgradeMigrationEntity,
        ),
        ...insertArgs,
      });

      return;
    }

    // The attempt number is derived from rows this call is about to write, so
    // two upgrade processes can read the same number and collide on the attempt
    // uniqueness constraint. Recompute and retry, one transaction per try so a
    // conflict leaves nothing half-written.
    for (
      let retriesLeft = UPGRADE_MIGRATION_CONFLICT_RETRIES;
      ;
      retriesLeft--
    ) {
      try {
        await this.upgradeMigrationRepository.manager.transaction(
          async (entityManager) =>
            this.insertAttempts({
              repository: entityManager.getRepository(UpgradeMigrationEntity),
              ...insertArgs,
            }),
        );

        return;
      } catch (error) {
        if (retriesLeft <= 0 || !isAttemptConflict(error)) {
          throw error;
        }
      }
    }
  }

  private async insertAttempts({
    repository,
    name,
    workspaceIds,
    isInstance,
    status,
    executedByVersion,
    errorMessage,
  }: {
    repository: Repository<UpgradeMigrationEntity>;
    name: string;
    workspaceIds: string[];
    isInstance: boolean;
    status: UpgradeMigrationStatus;
    executedByVersion: string;
    errorMessage: string | null;
  }): Promise<void> {
    if (isInstance) {
      // Every row an instance command writes shares the instance attempt
      // number, including the per-workspace cursor rows.
      const attempt = await this.getNextAttempt({
        repository,
        name,
        workspaceId: null,
      });

      const instanceRows = [
        {
          name,
          status,
          attempt,
          executedByVersion,
          workspaceId: null,
          errorMessage,
        },
        ...workspaceIds.map((workspaceId) => ({
          name,
          status,
          attempt,
          executedByVersion,
          workspaceId,
          errorMessage,
        })),
      ];

      for (const batch of chunk(
        instanceRows,
        UPGRADE_MIGRATION_SAVE_BATCH_SIZE,
      )) {
        await repository.save(batch);
      }

      return;
    }

    const rows = [];

    for (const workspaceId of workspaceIds) {
      rows.push({
        name,
        status,
        attempt: await this.getNextAttempt({ repository, name, workspaceId }),
        executedByVersion,
        workspaceId,
        errorMessage,
      });
    }

    for (const batch of chunk(rows, UPGRADE_MIGRATION_SAVE_BATCH_SIZE)) {
      await repository.save(batch);
    }
  }

  // Counting rows would renumber attempts if any were ever removed, handing the
  // next write a number that already exists.
  private async getNextAttempt({
    repository,
    name,
    workspaceId,
  }: {
    repository: Repository<UpgradeMigrationEntity>;
    name: string;
    workspaceId: string | null;
  }): Promise<number> {
    const highestAttempt = await repository.findOne({
      where: {
        name,
        workspaceId: workspaceId === null ? IsNull() : workspaceId,
      },
      order: { attempt: 'DESC' },
    });

    return isDefined(highestAttempt) ? highestAttempt.attempt + 1 : 1;
  }

  async markAsWorkspaceInitial({
    name,
    workspaceId,
    executedByVersion,
    status,
    queryRunner,
  }: {
    name: string;
    workspaceId: string;
    executedByVersion: string;
    status: UpgradeMigrationStatus;
    queryRunner?: QueryRunner;
  }): Promise<void> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(UpgradeMigrationEntity)
      : this.upgradeMigrationRepository;

    const existingInitialMigration = await repository.findOne({
      where: { name, attempt: 1, workspaceId, isInitial: true },
    });

    if (isDefined(existingInitialMigration)) {
      return;
    }

    await repository.save({
      name,
      status,
      isInitial: true,
      attempt: 1,
      executedByVersion,
      workspaceId,
    });
  }

  // Returns the most recently attempted command (by createdAt)
  // across instance and active-workspace scopes, with its status.
  // isInitial records are excluded — they represent activation
  // state, not execution progress.
  async getLastAttemptedCommandNameOrThrow(
    allProvisionedWorkspaceIds: string[],
  ): Promise<{
    name: string;
    status: UpgradeMigrationStatus;
  }> {
    const queryBuilder = this.upgradeMigrationRepository
      .createQueryBuilder('migration')
      .select(['migration.name', 'migration.status'])
      .andWhere('migration."isInitial" = false')
      .andWhere(
        `migration.attempt = (
          SELECT MAX(sub.attempt)
          FROM core."upgradeMigration" sub
          WHERE sub.name = migration.name
          AND (
            (sub."workspaceId" IS NULL AND migration."workspaceId" IS NULL)
            OR sub."workspaceId" = migration."workspaceId"
          )
        )`,
      );

    if (allProvisionedWorkspaceIds.length > 0) {
      queryBuilder.andWhere(
        '(migration."workspaceId" IS NULL OR migration."workspaceId" IN (:...allProvisionedWorkspaceIds))',
        { allProvisionedWorkspaceIds },
      );
    } else {
      queryBuilder.andWhere('migration."workspaceId" IS NULL');
    }

    const migration = await queryBuilder
      .orderBy('migration.createdAt', 'DESC')
      .getOne();

    if (!migration) {
      throw new Error(
        'No upgrade migration found — the database may not have been initialized',
      );
    }

    return { name: migration.name, status: migration.status };
  }

  async getWorkspaceLastAttemptedCommandName(
    workspaceIds: string[],
  ): Promise<Map<string, WorkspaceLastAttemptedCommand>> {
    if (workspaceIds.length === 0) {
      return new Map();
    }

    const rows = await this.upgradeMigrationRepository.manager.query<
      Array<{
        workspaceId: string;
        name: string;
        status: UpgradeMigrationStatus;
        executedByVersion: string;
        errorMessage: string | null;
        createdAt: Date;
        isInitial: boolean;
      }>
    >(
      `
        SELECT DISTINCT ON (latest_per_name."workspaceId")
          latest_per_name."workspaceId",
          latest_per_name.name,
          latest_per_name.status,
          latest_per_name."executedByVersion",
          latest_per_name."errorMessage",
          latest_per_name."createdAt",
          latest_per_name."isInitial"
        FROM (
          SELECT DISTINCT ON ("workspaceId", name)
            "workspaceId",
            name,
            status,
            "executedByVersion",
            "errorMessage",
            "createdAt",
            "isInitial"
          FROM core."upgradeMigration"
          WHERE "workspaceId" = ANY($1)
          ORDER BY "workspaceId", name, attempt DESC
        ) latest_per_name
        ORDER BY latest_per_name."workspaceId", latest_per_name."createdAt" DESC
      `,
      [workspaceIds],
    );

    const cursors = new Map<string, WorkspaceLastAttemptedCommand>();

    for (const row of rows) {
      cursors.set(row.workspaceId, {
        workspaceId: row.workspaceId,
        name: row.name,
        status: row.status,
        executedByVersion: row.executedByVersion,
        errorMessage: row.errorMessage,
        createdAt: row.createdAt,
        isInitial: row.isInitial,
      });
    }

    return cursors;
  }

  async getWorkspaceLastAttemptedCommandNameOrThrow(
    workspaceIds: string[],
  ): Promise<Map<string, WorkspaceLastAttemptedCommand>> {
    const cursors =
      await this.getWorkspaceLastAttemptedCommandName(workspaceIds);

    const missingWorkspaceIds = workspaceIds.filter(
      (workspaceId) => !cursors.has(workspaceId),
    );

    if (missingWorkspaceIds.length > 0) {
      throw new Error(
        `No upgrade migration found for workspace(s): ${missingWorkspaceIds.join(', ')}`,
      );
    }

    return cursors;
  }

  async areAllWorkspacesAtCommand({
    commandName,
    workspaceIds,
  }: {
    commandName: string;
    workspaceIds: string[];
  }): Promise<boolean> {
    if (workspaceIds.length === 0) {
      return true;
    }

    const completedCount = await this.upgradeMigrationRepository
      .createQueryBuilder('migration')
      .where({
        name: commandName,
        status: 'completed',
        workspaceId: In(workspaceIds),
      })
      .andWhere(
        `migration.attempt = (
          SELECT MAX(sub.attempt)
          FROM core."upgradeMigration" sub
          WHERE sub.name = migration.name
          AND sub."workspaceId" = migration."workspaceId"
        )`,
      )
      .getCount();

    return completedCount === workspaceIds.length;
  }

  // Latest attempt per instance command, keyed by name. There is deliberately
  // no "most recently attempted command" accessor: ordering these rows by
  // createdAt does not tell you how far the instance has got. Slow commands,
  // retries and --force runs all write rows newer than steps that ran long
  // before them, so the newest row can sit far behind the real position.
  // Resolve progress against the sequence order in code instead, which is what
  // getInstanceProgress does.
  async getLatestInstanceCommandAttempts(): Promise<
    Map<string, InstanceCommandAttempt>
  > {
    const migrations = await this.upgradeMigrationRepository
      .createQueryBuilder('migration')
      .select([
        'migration.name',
        'migration.status',
        'migration.executedByVersion',
        'migration.errorMessage',
        'migration.createdAt',
      ])
      .where('migration."workspaceId" IS NULL')
      .andWhere('migration."isInitial" = false')
      .andWhere(
        `migration.attempt = (
          SELECT MAX(sub.attempt)
          FROM core."upgradeMigration" sub
          WHERE sub.name = migration.name
          AND sub."workspaceId" IS NULL
        )`,
      )
      .getMany();

    return new Map(
      migrations.map((migration) => [
        migration.name,
        {
          name: migration.name,
          status: migration.status,
          executedByVersion: migration.executedByVersion,
          errorMessage: migration.errorMessage,
          createdAt: migration.createdAt,
        },
      ]),
    );
  }

  async getLatestInstanceCommandStatuses(): Promise<
    Map<string, UpgradeMigrationStatus>
  > {
    const attempts = await this.getLatestInstanceCommandAttempts();

    return new Map(
      [...attempts].map(([name, attempt]) => [name, attempt.status]),
    );
  }

  // Walks the sequence declared in code and stops at the first instance step
  // that has not completed, so execution order cannot affect the answer.
  async getInstanceProgress(): Promise<InstanceUpgradeProgress> {
    const attempts = await this.getLatestInstanceCommandAttempts();
    const sequence = this.upgradeSequenceReaderService.getUpgradeSequence();

    let lastCompleted: InstanceCommandAttempt | null = null;

    for (const step of sequence) {
      if (step.kind === 'workspace') {
        continue;
      }

      const attempt = attempts.get(step.name);

      if (!isDefined(attempt) || attempt.status !== 'completed') {
        return {
          lastCompleted,
          blocked: { name: step.name, attempt: attempt ?? null },
        };
      }

      lastCompleted = attempt;
    }

    return { lastCompleted, blocked: null };
  }

  // The command that defines where the instance stands: whatever is blocking
  // progress if anything is, otherwise the furthest step that completed.
  async getInstanceCommandCursor(): Promise<InstanceCommandAttempt | null> {
    const { lastCompleted, blocked } = await this.getInstanceProgress();

    if (isDefined(blocked) && isDefined(blocked.attempt)) {
      return blocked.attempt;
    }

    return lastCompleted;
  }

  async getInstanceCommandCursorOrThrow(): Promise<{
    name: string;
    status: UpgradeMigrationStatus;
  }> {
    const result = await this.getInstanceCommandCursor();

    if (!result) {
      throw new Error(
        'No instance command found — the database may not have been initialized',
      );
    }

    return result;
  }
}
