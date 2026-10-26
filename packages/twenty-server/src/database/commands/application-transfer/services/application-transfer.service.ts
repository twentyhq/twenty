import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import {
  type DataSource,
  type EntityManager,
  type EntityMetadata,
  type QueryRunner,
} from 'typeorm';

import { APPLICATION_TRANSFER_NON_COPIED_FILE_FOLDERS } from 'src/database/commands/application-transfer/constants/application-transfer-non-copied-file-folders.constant';
import {
  ApplicationTransferPreFlightService,
  type TransferredApplications,
} from 'src/database/commands/application-transfer/services/application-transfer-pre-flight.service';
import {
  type ApplicationDependencyFiles,
  ApplicationTransferStorageService,
} from 'src/database/commands/application-transfer/services/application-transfer-storage.service';
import { type ApplicationTransferReport } from 'src/database/commands/application-transfer/types/application-transfer-report.type';
import {
  computeRederivedUniversalIdentifiers,
  type RederivableMetadataName,
  type RederivableRowsByMetadataName,
} from 'src/database/commands/application-transfer/utils/compute-rederived-universal-identifiers.util';
import { foldTransferredEntityOverrides } from 'src/database/commands/application-transfer/utils/fold-transferred-entity-overrides.util';
import {
  buildQuotedTablePath,
  getApplicationTransferEntityMetadatas,
} from 'src/database/commands/application-transfer/utils/get-application-transfer-entity-metadatas.util';
import { APPLICATION_LIFECYCLE_LOCK_OPTIONS } from 'src/engine/core-modules/application/application-install/constants/application-lifecycle-lock-options.constant';
import { buildApplicationLifecycleLockKey } from 'src/engine/core-modules/application/application-install/utils/build-application-lifecycle-lock-key.util';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';
import { ALL_FLAT_ENTITY_MAPS_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-maps-properties.constant';
import { ALL_METADATA_ENTITY_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-entity-by-metadata-name.constant';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

export type ApplicationTransferOptions = {
  workspaceId: string;
  applicationUniversalIdentifier: string;
  isDryRun: boolean;
  shouldAdoptDefaultRole: boolean;
  shouldDeleteRegistration: boolean;
};

type TransferredRowIdsByTableName = Record<string, string[]>;

const REDERIVABLE_ROWS_QUERY_BY_METADATA_NAME: Record<
  keyof RederivableRowsByMetadataName,
  string
> = {
  objectMetadata: `"id", "universalIdentifier"`,
  fieldMetadata: `"id", "universalIdentifier", "objectMetadataId", "name", "relationTargetObjectMetadataId"`,
  index: `"id", "universalIdentifier", "objectMetadataId", "name"`,
  searchFieldMetadata: `"id", "universalIdentifier", "fieldMetadataId"`,
  view: `"id", "universalIdentifier", "objectMetadataId"`,
  viewField: `"id", "universalIdentifier", "viewId", "fieldMetadataId"`,
  viewFieldGroup: `"id", "universalIdentifier", "viewId", "name"`,
  pageLayout: `"id", "universalIdentifier", "objectMetadataId"`,
  pageLayoutTab: `"id", "universalIdentifier", "pageLayoutId", "title"`,
  pageLayoutWidget: `"id", "universalIdentifier", "pageLayoutTabId", "title", "configuration"->>'fieldMetadataId' AS "formFieldMetadataId"`,
  commandMenuItem: `"id", "universalIdentifier", "navigationTargetObjectMetadataId"`,
};

// Columns holding field universal identifiers instead of ids
const FIELD_UNIVERSAL_IDENTIFIER_REFERENCES = [
  {
    tableName: 'timelineActivityType',
    columnName: 'targetRelationFieldUniversalIdentifier',
    isArray: false,
  },
  {
    tableName: 'timelineActivityType',
    columnName: 'happensAtFieldUniversalIdentifier',
    isArray: false,
  },
  {
    tableName: 'timelineActivityType',
    columnName: 'triggerFieldUniversalIdentifiers',
    isArray: true,
  },
  {
    tableName: 'messageChannel',
    columnName: 'participantHandleFieldUniversalIdentifier',
    isArray: false,
  },
  {
    tableName: 'objectMetadata',
    columnName: 'readabilityParentFieldUniversalIdentifiers',
    isArray: true,
  },
] as const;

@Injectable()
export class ApplicationTransferService {
  private readonly logger = new Logger(ApplicationTransferService.name);

  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly applicationService: ApplicationService,
    private readonly applicationTransferPreFlightService: ApplicationTransferPreFlightService,
    private readonly applicationTransferStorageService: ApplicationTransferStorageService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationTranslationCacheService: ApplicationTranslationCacheService,
    private readonly cacheLockService: CacheLockService,
    private readonly fileStorageService: FileStorageService,
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
    private readonly sdkClientGenerationService: SdkClientGenerationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
  ) {}

  async transferToWorkspaceCustomApplicationOrThrow(
    options: ApplicationTransferOptions,
  ): Promise<ApplicationTransferReport> {
    const transferredApplications =
      await this.findTransferredApplicationsOrThrow(options);

    const report = await this.applicationTransferPreFlightService.buildReport(
      transferredApplications,
    );

    if (options.isDryRun) {
      return report;
    }

    this.assertNoBlockersOrThrow(report);

    const { sourceApplication, workspaceCustomApplication } =
      transferredApplications;

    return this.cacheLockService.withLock(
      () =>
        this.cacheLockService.withLock(
          () => this.runTransferOrThrow(options),
          buildApplicationLifecycleLockKey({
            workspaceId: options.workspaceId,
            universalIdentifier: workspaceCustomApplication.universalIdentifier,
          }),
          APPLICATION_LIFECYCLE_LOCK_OPTIONS,
        ),
      buildApplicationLifecycleLockKey({
        workspaceId: options.workspaceId,
        universalIdentifier: sourceApplication.universalIdentifier,
      }),
      APPLICATION_LIFECYCLE_LOCK_OPTIONS,
    );
  }

  private async runTransferOrThrow(
    options: ApplicationTransferOptions,
  ): Promise<ApplicationTransferReport> {
    const transferredApplications =
      await this.findTransferredApplicationsOrThrow(options);
    const { workspaceId, sourceApplication, workspaceCustomApplication } =
      transferredApplications;

    const report = await this.applicationTransferPreFlightService.buildReport(
      transferredApplications,
    );

    this.assertNoBlockersOrThrow(report);

    const sourceDependencyFiles = await this.readDependencyFilesToTransfer(
      transferredApplications,
    );
    const workspaceCustomDependencyFiles = isDefined(sourceDependencyFiles)
      ? await this.applicationTransferStorageService.readDependencyFiles({
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomApplication.universalIdentifier,
        })
      : undefined;

    const { copiedFilePaths, missingFilePaths } =
      await this.applicationTransferStorageService.copyFilesOrThrow({
        workspaceId,
        sourceApplicationUniversalIdentifier:
          sourceApplication.universalIdentifier,
        destinationApplicationUniversalIdentifier:
          workspaceCustomApplication.universalIdentifier,
        filePaths: await this.findFilePathsToCopy(sourceApplication.id),
      });

    if (missingFilePaths.length > 0) {
      this.logger.warn(
        `${missingFilePaths.length} file row(s) had no stored object to copy: ${missingFilePaths.join(', ')}`,
      );
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let transferredRowIdsByTableName: TransferredRowIdsByTableName;

    try {
      transferredRowIdsByTableName = await this.transferRowsInTransaction({
        ...transferredApplications,
        queryRunner,
        sourceDependencyFiles,
        shouldAdoptDefaultRole: options.shouldAdoptDefaultRole,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      await this.applicationTransferStorageService.deleteFiles({
        workspaceId,
        applicationUniversalIdentifier:
          workspaceCustomApplication.universalIdentifier,
        filePaths: copiedFilePaths,
      });

      if (isDefined(workspaceCustomDependencyFiles)) {
        await this.applicationTransferStorageService.restoreDependencyFiles({
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomApplication.universalIdentifier,
          ...workspaceCustomDependencyFiles,
        });
      }

      await this.invalidateStorageStock(transferredApplications);

      throw error;
    } finally {
      await queryRunner.release();
    }

    await this.finalizeTransfer({
      ...transferredApplications,
      transferredLogicFunctionIds:
        transferredRowIdsByTableName[this.getTableName('logicFunction')] ?? [],
      shouldDeleteRegistration: options.shouldDeleteRegistration,
    });

    this.logger.log(
      `Transferred application ${sourceApplication.universalIdentifier} into the workspace custom application of workspace ${workspaceId}; the custom application default role ${options.shouldAdoptDefaultRole && isDefined(sourceApplication.defaultRoleId) ? `moved from ${workspaceCustomApplication.defaultRoleId} to ${sourceApplication.defaultRoleId}` : `stays ${workspaceCustomApplication.defaultRoleId}`}`,
    );

    return report;
  }

  private async findTransferredApplicationsOrThrow({
    workspaceId,
    applicationUniversalIdentifier,
  }: Pick<
    ApplicationTransferOptions,
    'workspaceId' | 'applicationUniversalIdentifier'
  >): Promise<TransferredApplications> {
    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    if (
      [
        twentyStandardFlatApplication.universalIdentifier,
        workspaceCustomFlatApplication.universalIdentifier,
      ].includes(applicationUniversalIdentifier)
    ) {
      throw new ApplicationException(
        `Application ${applicationUniversalIdentifier} is a built-in application and cannot be transferred`,
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    const applicationRepository =
      this.coreDataSource.getRepository(ApplicationEntity);

    const [sourceApplication, workspaceCustomApplication] = await Promise.all([
      applicationRepository.findOne({
        where: {
          workspaceId,
          universalIdentifier: applicationUniversalIdentifier,
        },
      }),
      applicationRepository.findOne({
        where: { workspaceId, id: workspaceCustomFlatApplication.id },
      }),
    ]);

    if (
      !isDefined(sourceApplication) ||
      !isDefined(workspaceCustomApplication)
    ) {
      throw new ApplicationException(
        `Application ${applicationUniversalIdentifier} is not installed in workspace ${workspaceId}`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return { workspaceId, sourceApplication, workspaceCustomApplication };
  }

  private assertNoBlockersOrThrow(report: ApplicationTransferReport): void {
    if (report.blockers.length === 0) {
      return;
    }

    throw new ApplicationException(
      `Cannot transfer application ${report.sourceApplication.universalIdentifier}:\n- ${report.blockers.join('\n- ')}`,
      ApplicationExceptionCode.FORBIDDEN,
    );
  }

  private async readDependencyFilesToTransfer({
    workspaceId,
    sourceApplication,
    workspaceCustomApplication,
  }: TransferredApplications): Promise<ApplicationDependencyFiles | undefined> {
    const hasSourceDependencies =
      await this.applicationTransferPreFlightService.hasSourceDependencies(
        sourceApplication,
      );
    const hasSameDependencies =
      workspaceCustomApplication.packageJsonChecksum ===
        sourceApplication.packageJsonChecksum &&
      workspaceCustomApplication.yarnLockChecksum ===
        sourceApplication.yarnLockChecksum;

    if (!hasSourceDependencies || hasSameDependencies) {
      return undefined;
    }

    return this.applicationTransferStorageService.readDependencyFiles({
      workspaceId,
      applicationUniversalIdentifier: sourceApplication.universalIdentifier,
    });
  }

  private async findFilePathsToCopy(applicationId: string): Promise<string[]> {
    const fileRows: { path: string }[] = await this.coreDataSource.query(
      `SELECT "path" FROM core."file"
       WHERE "applicationId" = $1 AND split_part("path", '/', 1) <> ALL($2)`,
      [applicationId, APPLICATION_TRANSFER_NON_COPIED_FILE_FOLDERS],
    );

    return fileRows.map(({ path }) => path);
  }

  private async transferRowsInTransaction({
    workspaceId,
    sourceApplication,
    workspaceCustomApplication,
    queryRunner,
    sourceDependencyFiles,
    shouldAdoptDefaultRole,
  }: TransferredApplications & {
    queryRunner: QueryRunner;
    sourceDependencyFiles: ApplicationDependencyFiles | undefined;
    shouldAdoptDefaultRole: boolean;
  }): Promise<TransferredRowIdsByTableName> {
    const { manager } = queryRunner;

    await manager.update(
      ApplicationEntity,
      { id: sourceApplication.id },
      {
        packageJsonFileId: null,
        yarnLockFileId: null,
        defaultRoleId: null,
        settingsCustomTabFrontComponentId: null,
        uninstallLogicFunctionId: null,
        healthCheckLogicFunctionId: null,
        logicFunctionLayerId: null,
        primaryPublicDomainId: null,
        canBeUninstalled: true,
      },
    );

    await manager.query(
      `DELETE FROM core."file"
       WHERE "applicationId" = $1 AND split_part("path", '/', 1) = ANY($2)`,
      [sourceApplication.id, APPLICATION_TRANSFER_NON_COPIED_FILE_FOLDERS],
    );

    const transferredRowIdsByTableName: TransferredRowIdsByTableName = {};

    for (const entityMetadata of getApplicationTransferEntityMetadatas(
      this.coreDataSource,
    )) {
      const [transferredRows]: [{ id: string }[], number] = await manager.query(
        `UPDATE ${buildQuotedTablePath(entityMetadata)} SET "applicationId" = $1
         WHERE "applicationId" = $2 RETURNING "id"`,
        [workspaceCustomApplication.id, sourceApplication.id],
      );

      transferredRowIdsByTableName[entityMetadata.tableName] =
        transferredRows.map(({ id }) => id);
    }

    await this.foldTransferredOverrides({
      manager,
      transferredRowIdsByTableName,
      sourceApplicationUniversalIdentifier:
        sourceApplication.universalIdentifier,
      workspaceCustomApplicationUniversalIdentifier:
        workspaceCustomApplication.universalIdentifier,
    });

    await this.rederiveEngineUniversalIdentifiers({
      manager,
      workspaceId,
      sourceApplicationUniversalIdentifier:
        sourceApplication.universalIdentifier,
      workspaceCustomApplicationUniversalIdentifier:
        workspaceCustomApplication.universalIdentifier,
    });

    if (isDefined(sourceDependencyFiles)) {
      await this.applicationService.uploadPackageFilesAndSetFileIds({
        application: workspaceCustomApplication,
        ...sourceDependencyFiles,
        queryRunner,
      });
    }

    await this.copyRegistrationScopedRows({
      manager,
      sourceApplicationRegistrationId:
        sourceApplication.applicationRegistrationId,
      workspaceCustomApplicationRegistrationId:
        workspaceCustomApplication.applicationRegistrationId,
    });

    await manager.update(
      ApplicationEntity,
      { id: workspaceCustomApplication.id },
      {
        isSdkLayerStale: true,
        grantedCapabilities: [
          ...new Set([
            ...workspaceCustomApplication.grantedCapabilities,
            ...sourceApplication.grantedCapabilities,
          ]),
        ],
        ...(shouldAdoptDefaultRole && isDefined(sourceApplication.defaultRoleId)
          ? { defaultRoleId: sourceApplication.defaultRoleId }
          : {}),
        ...(isDefined(workspaceCustomApplication.primaryPublicDomainId)
          ? {}
          : { primaryPublicDomainId: sourceApplication.primaryPublicDomainId }),
        ...(isDefined(
          workspaceCustomApplication.frontComponentSharedDependenciesChecksum,
        )
          ? {}
          : {
              frontComponentSharedDependenciesChecksum:
                sourceApplication.frontComponentSharedDependenciesChecksum,
              frontComponentSharedDependenciesBuiltPath:
                sourceApplication.frontComponentSharedDependenciesBuiltPath,
            }),
      },
    );

    const remainingReferences = (
      await this.applicationTransferPreFlightService.findApplicationReferences({
        manager,
        applicationId: sourceApplication.id,
      })
    ).filter(({ rowCount }) => rowCount > 0);

    if (remainingReferences.length > 0) {
      throw new ApplicationException(
        `Rows still reference the source application after the transfer: ${remainingReferences
          .map(
            ({ tableName, columnName, rowCount }) =>
              `${tableName}.${columnName} (${rowCount})`,
          )
          .join(', ')}`,
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    return transferredRowIdsByTableName;
  }

  private async foldTransferredOverrides({
    manager,
    transferredRowIdsByTableName,
    sourceApplicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
  }: {
    manager: EntityManager;
    transferredRowIdsByTableName: TransferredRowIdsByTableName;
    sourceApplicationUniversalIdentifier: string;
    workspaceCustomApplicationUniversalIdentifier: string;
  }): Promise<void> {
    for (const [metadataName, entity] of Object.entries(
      ALL_METADATA_ENTITY_BY_METADATA_NAME,
    )) {
      const entityMetadata = this.coreDataSource.getMetadata(entity);
      const transferredRowIds =
        transferredRowIdsByTableName[entityMetadata.tableName] ?? [];

      if (
        transferredRowIds.length === 0 ||
        !isDefined(entityMetadata.findColumnWithPropertyName('overrides'))
      ) {
        continue;
      }

      const hasSystemSideEffectColumn = isDefined(
        entityMetadata.findColumnWithPropertyName('isSystemSideEffect'),
      );
      const columnPropertyNames = new Set(
        entityMetadata.columns.map(({ propertyName }) => propertyName),
      );

      const overriddenRows: {
        id: string;
        overrides: unknown;
        isSystemSideEffect: boolean | null;
      }[] = await manager.query(
        `SELECT "id", "overrides",
                ${hasSystemSideEffectColumn ? '"isSystemSideEffect"' : 'NULL'} AS "isSystemSideEffect"
         FROM ${buildQuotedTablePath(entityMetadata)}
         WHERE "id" = ANY($1) AND "overrides" IS NOT NULL`,
        [transferredRowIds],
      );

      for (const overriddenRow of overriddenRows) {
        const { columnUpdates, overrides } = foldTransferredEntityOverrides({
          metadataName: metadataName as AllMetadataName,
          overrides: overriddenRow.overrides,
          sourceApplicationUniversalIdentifier,
          workspaceCustomApplicationUniversalIdentifier,
          isSystemSideEffect: overriddenRow.isSystemSideEffect === true,
          columnPropertyNames,
        });

        await manager.update(
          entityMetadata.target,
          { id: overriddenRow.id },
          { ...columnUpdates, overrides },
        );
      }
    }
  }

  private async rederiveEngineUniversalIdentifiers({
    manager,
    workspaceId,
    sourceApplicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
  }: {
    manager: EntityManager;
    workspaceId: string;
    sourceApplicationUniversalIdentifier: string;
    workspaceCustomApplicationUniversalIdentifier: string;
  }): Promise<void> {
    const rowsByMetadataName = Object.fromEntries(
      await Promise.all(
        Object.entries(REDERIVABLE_ROWS_QUERY_BY_METADATA_NAME).map(
          async ([metadataName, selectList]) => [
            metadataName,
            await manager.query(
              `SELECT ${selectList} FROM ${buildQuotedTablePath(this.getEntityMetadata(metadataName as AllMetadataName))}
               WHERE "workspaceId" = $1`,
              [workspaceId],
            ),
          ],
        ),
      ),
    ) as RederivableRowsByMetadataName;

    const rederivedByMetadataName = computeRederivedUniversalIdentifiers({
      rowsByMetadataName,
      sourceApplicationUniversalIdentifier,
      destinationApplicationUniversalIdentifier:
        workspaceCustomApplicationUniversalIdentifier,
    });

    for (const [metadataName, rederivedUniversalIdentifiers] of Object.entries(
      rederivedByMetadataName,
    ) as [RederivableMetadataName, typeof rederivedByMetadataName.view][]) {
      const tablePath = buildQuotedTablePath(
        this.getEntityMetadata(metadataName),
      );

      for (const { id, universalIdentifier } of rederivedUniversalIdentifiers) {
        await manager.query(
          `UPDATE ${tablePath} SET "universalIdentifier" = $1 WHERE "id" = $2`,
          [universalIdentifier, id],
        );
      }

      if (rederivedUniversalIdentifiers.length > 0) {
        this.logger.log(
          `Re-derived ${rederivedUniversalIdentifiers.length} ${metadataName} universal identifier(s)`,
        );
      }
    }

    for (const {
      previousUniversalIdentifier,
      universalIdentifier,
    } of rederivedByMetadataName.fieldMetadata) {
      for (const {
        tableName,
        columnName,
        isArray,
      } of FIELD_UNIVERSAL_IDENTIFIER_REFERENCES) {
        await manager.query(
          isArray
            ? `UPDATE core."${tableName}" SET "${columnName}" = array_replace("${columnName}", $1::uuid, $2::uuid)
               WHERE "workspaceId" = $3 AND $1::uuid = ANY("${columnName}")`
            : `UPDATE core."${tableName}" SET "${columnName}" = $2
               WHERE "workspaceId" = $3 AND "${columnName}" = $1`,
          [previousUniversalIdentifier, universalIdentifier, workspaceId],
        );
      }
    }
  }

  // The executor reads server variables and the catalog through the owner's registration
  private async copyRegistrationScopedRows({
    manager,
    sourceApplicationRegistrationId,
    workspaceCustomApplicationRegistrationId,
  }: {
    manager: EntityManager;
    sourceApplicationRegistrationId: string | null;
    workspaceCustomApplicationRegistrationId: string | null;
  }): Promise<void> {
    if (
      !isDefined(sourceApplicationRegistrationId) ||
      !isDefined(workspaceCustomApplicationRegistrationId) ||
      sourceApplicationRegistrationId ===
        workspaceCustomApplicationRegistrationId
    ) {
      return;
    }

    await manager.query(
      `INSERT INTO core."applicationRegistrationVariable"
         ("key", "encryptedValue", "description", "isSecret", "isRequired", "isDeprecated", "type", "options", "applicationRegistrationId")
       SELECT "key", "encryptedValue", "description", "isSecret", "isRequired", "isDeprecated", "type", "options", $2
       FROM core."applicationRegistrationVariable"
       WHERE "applicationRegistrationId" = $1`,
      [
        sourceApplicationRegistrationId,
        workspaceCustomApplicationRegistrationId,
      ],
    );

    // Message ids hash their source string, so merging catalogs cannot mistranslate
    await manager.query(
      `INSERT INTO core."applicationTranslation" ("applicationRegistrationId", "locale", "messages")
       SELECT $2, "locale", "messages"
       FROM core."applicationTranslation"
       WHERE "applicationRegistrationId" = $1 AND "deletedAt" IS NULL
       ON CONFLICT ("applicationRegistrationId", "locale") WHERE "deletedAt" IS NULL
       DO UPDATE SET "messages" = EXCLUDED."messages" || core."applicationTranslation"."messages"`,
      [
        sourceApplicationRegistrationId,
        workspaceCustomApplicationRegistrationId,
      ],
    );
  }

  private async finalizeTransfer({
    workspaceId,
    sourceApplication,
    workspaceCustomApplication,
    transferredLogicFunctionIds,
    shouldDeleteRegistration,
  }: TransferredApplications & {
    transferredLogicFunctionIds: string[];
    shouldDeleteRegistration: boolean;
  }): Promise<void> {
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatApplicationMaps',
    ]);
    await this.workspaceMigrationRunnerService.invalidateCache({
      allFlatEntityMapsKeys: ALL_FLAT_ENTITY_MAPS_PROPERTIES,
      workspaceId,
      hasSchemaMetadataChanged: true,
      hasMorphRelationFieldChanged: true,
    });

    await this.applicationService.delete(
      sourceApplication.universalIdentifier,
      workspaceId,
    );

    await this.runCleanupStep('delete the orphan logic function layer', () =>
      this.deleteOrphanLogicFunctionLayer(
        sourceApplication.logicFunctionLayerId,
      ),
    );

    await this.runCleanupStep(
      'invalidate storage and translation caches',
      async () => {
        await this.invalidateStorageStock({
          workspaceId,
          sourceApplication,
          workspaceCustomApplication,
        });

        for (const applicationRegistrationId of [
          sourceApplication.applicationRegistrationId,
          workspaceCustomApplication.applicationRegistrationId,
        ].filter(isDefined)) {
          await this.applicationTranslationCacheService.invalidate(
            applicationRegistrationId,
          );
        }
      },
    );

    await this.runCleanupStep('delete deployed logic function resources', () =>
      this.deleteLogicFunctionResources({
        workspaceId,
        sourceApplicationUniversalIdentifier:
          sourceApplication.universalIdentifier,
        transferredLogicFunctionIds,
      }),
    );

    await this.runCleanupStep('enqueue SDK client generation', () =>
      this.sdkClientGenerationService.enqueueSdkClientGenerationForWorkspace(
        workspaceId,
      ),
    );

    if (shouldDeleteRegistration) {
      await this.runCleanupStep('delete the source registration', () =>
        this.deleteSourceRegistration({ workspaceId, sourceApplication }),
      );
    }
  }

  private async runCleanupStep(
    description: string,
    cleanupStep: () => Promise<unknown>,
  ): Promise<void> {
    try {
      await cleanupStep();
    } catch (error) {
      this.logger.error(
        `Transfer committed but failed to ${description}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async deleteOrphanLogicFunctionLayer(
    logicFunctionLayerId: string | null,
  ): Promise<void> {
    if (!isDefined(logicFunctionLayerId)) {
      return;
    }

    await this.coreDataSource.query(
      `DELETE FROM core."logicFunctionLayer"
       WHERE "id" = $1
         AND NOT EXISTS (SELECT 1 FROM core."application" WHERE "logicFunctionLayerId" = $1)`,
      [logicFunctionLayerId],
    );
  }

  // Deployed functions were built against the source layers; deleting them forces a redeploy
  private async deleteLogicFunctionResources({
    workspaceId,
    sourceApplicationUniversalIdentifier,
    transferredLogicFunctionIds,
  }: {
    workspaceId: string;
    sourceApplicationUniversalIdentifier: string;
    transferredLogicFunctionIds: string[];
  }): Promise<void> {
    const driver = this.logicFunctionDriverFactory.getCurrentDriver();
    const { flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
      ]);

    for (const logicFunctionId of transferredLogicFunctionIds) {
      const flatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatLogicFunctionMaps,
        flatEntityId: logicFunctionId,
      });

      if (isDefined(flatLogicFunction)) {
        await driver.delete(flatLogicFunction);
      }
    }

    await driver.deleteApplicationResources({
      workspaceId,
      applicationUniversalIdentifier: sourceApplicationUniversalIdentifier,
    });
  }

  private async deleteSourceRegistration({
    workspaceId,
    sourceApplication,
  }: Pick<
    TransferredApplications,
    'workspaceId' | 'sourceApplication'
  >): Promise<void> {
    if (!isDefined(sourceApplication.applicationRegistrationId)) {
      return;
    }

    const otherInstallationCount =
      await this.applicationService.countInstalledWorkspacesForApplication(
        sourceApplication.universalIdentifier,
      );

    if (otherInstallationCount > 0) {
      this.logger.warn(
        `Kept registration ${sourceApplication.applicationRegistrationId}: ${otherInstallationCount} other workspace(s) still install it`,
      );

      return;
    }

    await this.applicationRegistrationService.delete({
      applicationRegistrationId: sourceApplication.applicationRegistrationId,
      ownerWorkspaceId: workspaceId,
    });
  }

  private async invalidateStorageStock({
    workspaceId,
    sourceApplication,
    workspaceCustomApplication,
  }: TransferredApplications): Promise<void> {
    for (const applicationId of [
      sourceApplication.id,
      workspaceCustomApplication.id,
    ]) {
      await this.fileStorageService.invalidateStorageStock({
        workspaceId,
        applicationId,
      });
    }
  }

  private getEntityMetadata(metadataName: AllMetadataName): EntityMetadata {
    return this.coreDataSource.getMetadata(
      ALL_METADATA_ENTITY_BY_METADATA_NAME[metadataName],
    );
  }

  private getTableName(metadataName: AllMetadataName): string {
    return this.getEntityMetadata(metadataName).tableName;
  }
}
