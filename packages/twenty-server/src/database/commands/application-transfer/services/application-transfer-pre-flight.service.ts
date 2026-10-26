import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type DataSource, type EntityManager } from 'typeorm';

import { APPLICATION_TRANSFER_NON_COPIED_FILE_FOLDERS } from 'src/database/commands/application-transfer/constants/application-transfer-non-copied-file-folders.constant';
import {
  type ApplicationTransferCollision,
  type ApplicationTransferReport,
} from 'src/database/commands/application-transfer/types/application-transfer-report.type';
import {
  findCollidingKeyTuples,
  type KeyTuple,
} from 'src/database/commands/application-transfer/utils/find-colliding-key-tuples.util';
import {
  buildQuotedTablePath,
  getApplicationTransferEntityMetadatas,
} from 'src/database/commands/application-transfer/utils/get-application-transfer-entity-metadatas.util';
import { getDefaultApplicationPackageFields } from 'src/engine/core-modules/application/application-package/utils/get-default-application-package-fields.util';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';

const APPLICATION_ID_KEY_EXPRESSION = '"applicationId"';

const FILE_TABLE_NAME = 'file';

// Those rows are deleted rather than transferred, so they can never collide
const NON_COPIED_FILE_EXCLUSION_CLAUSE = `split_part("path", '/', 1) NOT IN (${APPLICATION_TRANSFER_NON_COPIED_FILE_FOLDERS.map(
  (fileFolder) => `'${fileFolder}'`,
).join(', ')})`;

type UniqueIndexDefinition = {
  tableName: string;
  constraintName: string;
  predicate: string | null;
  keyExpressions: string[];
};

export type ApplicationReference = {
  schemaName: string;
  tableName: string;
  columnName: string;
};

export type TransferredApplications = {
  workspaceId: string;
  sourceApplication: ApplicationEntity;
  workspaceCustomApplication: ApplicationEntity;
};

@Injectable()
export class ApplicationTransferPreFlightService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly applicationService: ApplicationService,
  ) {}

  async buildReport({
    workspaceId,
    sourceApplication,
    workspaceCustomApplication,
    manager = this.coreDataSource.manager,
  }: TransferredApplications & {
    manager?: EntityManager;
  }): Promise<ApplicationTransferReport> {
    const rowCountByTableName = await this.countRowsByTableName({
      manager,
      applicationId: sourceApplication.id,
    });

    const collisions = [
      ...(await this.findUniqueIndexCollisions({
        manager,
        sourceApplicationId: sourceApplication.id,
        destinationApplicationId: workspaceCustomApplication.id,
      })),
      ...(await this.findKeyCollisions({
        manager,
        tableName: 'applicationVariable',
        constraintName: 'application variable key',
        query: `SELECT "key" FROM core."applicationVariable" WHERE "applicationId" = $1`,
        sourceParameter: sourceApplication.id,
        destinationParameter: workspaceCustomApplication.id,
      })),
      ...(await this.findRegistrationVariableCollisions({
        manager,
        sourceApplication,
        workspaceCustomApplication,
      })),
    ];

    const blockers = [
      ...collisions.map(
        ({ tableName, constraintName, collidingKeys }) =>
          `${collidingKeys.length} ${tableName} row(s) collide on ${constraintName}: ${collidingKeys
            .slice(0, 5)
            .map((collidingKey) => JSON.stringify(collidingKey))
            .join(', ')}`,
      ),
      ...(await this.findLifecycleBlockers({
        manager,
        workspaceId,
        sourceApplication,
        workspaceCustomApplication,
      })),
      ...(
        await this.findUnexpectedApplicationReferences({
          manager,
          applicationId: sourceApplication.id,
        })
      ).map(
        ({ tableName, columnName }) =>
          `${tableName}.${columnName} references the source application but is not transferred`,
      ),
    ];

    return {
      workspaceId,
      sourceApplication: {
        id: sourceApplication.id,
        universalIdentifier: sourceApplication.universalIdentifier,
        name: sourceApplication.name,
        defaultRoleId: sourceApplication.defaultRoleId,
      },
      workspaceCustomApplication: {
        id: workspaceCustomApplication.id,
        universalIdentifier: workspaceCustomApplication.universalIdentifier,
        defaultRoleId: workspaceCustomApplication.defaultRoleId,
      },
      rowCountByTableName,
      fileCountToCopy: await this.countFilesToCopy({
        manager,
        applicationId: sourceApplication.id,
      }),
      collisions,
      blockers,
    };
  }

  async findApplicationReferences({
    manager,
    applicationId,
  }: {
    manager: EntityManager;
    applicationId: string;
  }): Promise<(ApplicationReference & { rowCount: number })[]> {
    const applicationReferences: ApplicationReference[] = await manager.query(
      `SELECT referencing_namespace.nspname AS "schemaName",
              referencing_table.relname AS "tableName",
              referencing_column.attname AS "columnName"
       FROM pg_constraint foreign_key
       JOIN pg_class referencing_table ON referencing_table.oid = foreign_key.conrelid
       JOIN pg_namespace referencing_namespace ON referencing_namespace.oid = referencing_table.relnamespace
       JOIN pg_attribute referencing_column
         ON referencing_column.attrelid = foreign_key.conrelid
        AND referencing_column.attnum = foreign_key.conkey[1]
       WHERE foreign_key.contype = 'f'
         AND foreign_key.confrelid = 'core.application'::regclass`,
    );

    return Promise.all(
      applicationReferences.map(async (applicationReference) => {
        const [{ rowCount }] = await manager.query(
          `SELECT COUNT(*)::int AS "rowCount"
           FROM "${applicationReference.schemaName}"."${applicationReference.tableName}"
           WHERE "${applicationReference.columnName}" = $1`,
          [applicationId],
        );

        return { ...applicationReference, rowCount };
      }),
    );
  }

  private async countRowsByTableName({
    manager,
    applicationId,
  }: {
    manager: EntityManager;
    applicationId: string;
  }): Promise<Record<string, number>> {
    const rowCountByTableName: Record<string, number> = {};

    for (const entityMetadata of getApplicationTransferEntityMetadatas(
      this.coreDataSource,
    )) {
      const [{ rowCount }] = await manager.query(
        `SELECT COUNT(*)::int AS "rowCount" FROM ${buildQuotedTablePath(entityMetadata)} WHERE "applicationId" = $1`,
        [applicationId],
      );

      if (rowCount > 0) {
        rowCountByTableName[entityMetadata.tableName] = rowCount;
      }
    }

    return rowCountByTableName;
  }

  private async countFilesToCopy({
    manager,
    applicationId,
  }: {
    manager: EntityManager;
    applicationId: string;
  }): Promise<number> {
    const [{ fileCount }] = await manager.query(
      `SELECT COUNT(*)::int AS "fileCount" FROM core."file"
       WHERE "applicationId" = $1 AND ${NON_COPIED_FILE_EXCLUSION_CLAUSE}`,
      [applicationId],
    );

    return fileCount;
  }

  private async findUniqueIndexCollisions({
    manager,
    sourceApplicationId,
    destinationApplicationId,
  }: {
    manager: EntityManager;
    sourceApplicationId: string;
    destinationApplicationId: string;
  }): Promise<ApplicationTransferCollision[]> {
    const entityMetadatas = getApplicationTransferEntityMetadatas(
      this.coreDataSource,
    );

    const uniqueIndexDefinitions: UniqueIndexDefinition[] = await manager.query(
      `SELECT indexed_table.relname AS "tableName",
              index_class.relname AS "constraintName",
              pg_get_expr(unique_index.indpred, unique_index.indrelid) AS "predicate",
              ARRAY(
                SELECT pg_get_indexdef(unique_index.indexrelid, key_position, true)
                FROM generate_series(1, unique_index.indnkeyatts) AS key_position
                ORDER BY key_position
              ) AS "keyExpressions"
       FROM pg_index unique_index
       JOIN pg_class index_class ON index_class.oid = unique_index.indexrelid
       JOIN pg_class indexed_table ON indexed_table.oid = unique_index.indrelid
       JOIN pg_namespace indexed_namespace ON indexed_namespace.oid = indexed_table.relnamespace
       WHERE unique_index.indisunique
         AND indexed_namespace.nspname = 'core'
         AND indexed_table.relname = ANY($1)`,
      [entityMetadatas.map(({ tableName }) => tableName)],
    );

    const collisions: ApplicationTransferCollision[] = [];

    for (const uniqueIndexDefinition of uniqueIndexDefinitions) {
      if (
        !uniqueIndexDefinition.keyExpressions.includes(
          APPLICATION_ID_KEY_EXPRESSION,
        )
      ) {
        continue;
      }

      const otherKeyExpressions = uniqueIndexDefinition.keyExpressions.filter(
        (keyExpression) => keyExpression !== APPLICATION_ID_KEY_EXPRESSION,
      );
      const selectList = [
        'NULL AS "unused"',
        ...otherKeyExpressions.map(
          (keyExpression, keyPosition) =>
            `${keyExpression} AS "key${keyPosition}"`,
        ),
      ].join(', ');
      const predicateClause = isDefined(uniqueIndexDefinition.predicate)
        ? `AND (${uniqueIndexDefinition.predicate})`
        : '';
      const nonCopiedFileClause =
        uniqueIndexDefinition.tableName === FILE_TABLE_NAME
          ? `AND ${NON_COPIED_FILE_EXCLUSION_CLAUSE}`
          : '';

      collisions.push(
        ...(await this.findKeyCollisions({
          manager,
          tableName: uniqueIndexDefinition.tableName,
          constraintName: uniqueIndexDefinition.constraintName,
          query: `SELECT ${selectList} FROM core."${uniqueIndexDefinition.tableName}"
                  WHERE "applicationId" = $1 ${predicateClause} ${nonCopiedFileClause}`,
          sourceParameter: sourceApplicationId,
          destinationParameter: destinationApplicationId,
        })),
      );
    }

    return collisions;
  }

  private async findRegistrationVariableCollisions({
    manager,
    sourceApplication,
    workspaceCustomApplication,
  }: {
    manager: EntityManager;
    sourceApplication: ApplicationEntity;
    workspaceCustomApplication: ApplicationEntity;
  }): Promise<ApplicationTransferCollision[]> {
    if (
      !isDefined(sourceApplication.applicationRegistrationId) ||
      !isDefined(workspaceCustomApplication.applicationRegistrationId)
    ) {
      return [];
    }

    return this.findKeyCollisions({
      manager,
      tableName: 'applicationRegistrationVariable',
      constraintName: 'registration variable key',
      query: `SELECT "key" FROM core."applicationRegistrationVariable" WHERE "applicationRegistrationId" = $1`,
      sourceParameter: sourceApplication.applicationRegistrationId,
      destinationParameter:
        workspaceCustomApplication.applicationRegistrationId,
    });
  }

  private async findKeyCollisions({
    manager,
    tableName,
    constraintName,
    query,
    sourceParameter,
    destinationParameter,
  }: {
    manager: EntityManager;
    tableName: string;
    constraintName: string;
    query: string;
    sourceParameter: string;
    destinationParameter: string;
  }): Promise<ApplicationTransferCollision[]> {
    const toKeyTuple = (row: Record<string, unknown>): KeyTuple =>
      Object.entries(row)
        .filter(([column]) => column !== 'unused')
        .map(([, value]) => value);

    const [sourceRows, destinationRows]: Record<string, unknown>[][] =
      await Promise.all([
        manager.query(query, [sourceParameter]),
        manager.query(query, [destinationParameter]),
      ]);

    const collidingKeys = findCollidingKeyTuples({
      sourceKeyTuples: sourceRows.map(toKeyTuple),
      destinationKeyTuples: destinationRows.map(toKeyTuple),
    });

    return collidingKeys.length > 0
      ? [{ tableName, constraintName, collidingKeys }]
      : [];
  }

  private async findLifecycleBlockers({
    manager,
    workspaceId,
    sourceApplication,
    workspaceCustomApplication,
  }: TransferredApplications & { manager: EntityManager }): Promise<string[]> {
    const blockers: string[] = [];

    const [{ deferredActionCount }] = await manager.query(
      `SELECT COUNT(*)::int AS "deferredActionCount"
       FROM core."deferredWorkspaceMigrationAction"
       WHERE "workspaceId" = $1 AND "applicationUniversalIdentifier" = $2`,
      [workspaceId, sourceApplication.universalIdentifier],
    );

    if (deferredActionCount > 0) {
      blockers.push(
        `${deferredActionCount} deferred workspace migration action(s) are still pending for the source application`,
      );
    }

    const isServedToOtherWorkspaces =
      await this.applicationService.isUninstallBlockedByOtherWorkspaceInstallations(
        {
          applicationId: sourceApplication.id,
          applicationRegistrationId:
            sourceApplication.applicationRegistrationId,
          workspaceId,
        },
      );

    if (isServedToOtherWorkspaces) {
      blockers.push(
        'The source application serves a route that other workspaces installing it rely on',
      );
    }

    if (
      isDefined(sourceApplication.frontComponentSharedDependenciesChecksum) &&
      isDefined(
        workspaceCustomApplication.frontComponentSharedDependenciesChecksum,
      ) &&
      sourceApplication.frontComponentSharedDependenciesChecksum !==
        workspaceCustomApplication.frontComponentSharedDependenciesChecksum
    ) {
      blockers.push(
        'Both applications declare different front component shared dependencies',
      );
    }

    if (
      (await this.hasSourceDependencies(sourceApplication)) &&
      !(await this.canReplaceDependencies({
        sourceApplication,
        workspaceCustomApplication,
      }))
    ) {
      blockers.push(
        'The workspace custom application already declares its own package dependencies',
      );
    }

    return blockers;
  }

  async hasSourceDependencies(
    sourceApplication: ApplicationEntity,
  ): Promise<boolean> {
    const { packageJsonChecksum, yarnLockChecksum } =
      await getDefaultApplicationPackageFields();

    return (
      isDefined(sourceApplication.packageJsonFileId) &&
      isDefined(sourceApplication.yarnLockFileId) &&
      (sourceApplication.packageJsonChecksum !== packageJsonChecksum ||
        sourceApplication.yarnLockChecksum !== yarnLockChecksum)
    );
  }

  private async canReplaceDependencies({
    sourceApplication,
    workspaceCustomApplication,
  }: {
    sourceApplication: ApplicationEntity;
    workspaceCustomApplication: ApplicationEntity;
  }): Promise<boolean> {
    const { packageJsonChecksum, yarnLockChecksum } =
      await getDefaultApplicationPackageFields();

    const hasDefaultDependencies =
      workspaceCustomApplication.packageJsonChecksum === packageJsonChecksum &&
      workspaceCustomApplication.yarnLockChecksum === yarnLockChecksum;
    const hasSameDependencies =
      workspaceCustomApplication.packageJsonChecksum ===
        sourceApplication.packageJsonChecksum &&
      workspaceCustomApplication.yarnLockChecksum ===
        sourceApplication.yarnLockChecksum;

    return hasDefaultDependencies || hasSameDependencies;
  }

  private async findUnexpectedApplicationReferences({
    manager,
    applicationId,
  }: {
    manager: EntityManager;
    applicationId: string;
  }): Promise<ApplicationReference[]> {
    const transferredTableNames = new Set(
      getApplicationTransferEntityMetadatas(this.coreDataSource).map(
        ({ tableName }) => tableName,
      ),
    );

    const applicationReferences = await this.findApplicationReferences({
      manager,
      applicationId,
    });

    return applicationReferences.filter(
      ({ tableName, columnName, rowCount }) =>
        rowCount > 0 &&
        !(
          transferredTableNames.has(tableName) && columnName === 'applicationId'
        ),
    );
  }
}
