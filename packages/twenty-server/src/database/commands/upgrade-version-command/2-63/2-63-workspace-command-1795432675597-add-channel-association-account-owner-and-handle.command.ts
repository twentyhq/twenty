import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// Each batch commits on its own so a large mailbox never holds every row lock at once
const BACKFILL_BATCH_SIZE = 5000;

const FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.calendarChannelEventAssociation.fields.accountOwner
    .universalIdentifier,
  STANDARD_OBJECTS.calendarChannelEventAssociation.fields.handle
    .universalIdentifier,
  STANDARD_OBJECTS.messageChannelMessageAssociation.fields.accountOwner
    .universalIdentifier,
  STANDARD_OBJECTS.messageChannelMessageAssociation.fields.handle
    .universalIdentifier,
  STANDARD_OBJECTS.workspaceMember.fields
    .accountOwnerForCalendarChannelEventAssociations.universalIdentifier,
  STANDARD_OBJECTS.workspaceMember.fields
    .accountOwnerForMessageChannelMessageAssociations.universalIdentifier,
];

const ACCOUNT_OWNER_INDEX_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.calendarChannelEventAssociation.indexes.accountOwnerIdIndex
    .universalIdentifier,
  STANDARD_OBJECTS.messageChannelMessageAssociation.indexes.accountOwnerIdIndex
    .universalIdentifier,
];

const ASSOCIATION_BACKFILLS = [
  {
    associationTableName: 'calendarChannelEventAssociation',
    channelIdColumnName: 'calendarChannelId',
    coreChannelTableName: 'calendarChannel',
  },
  {
    associationTableName: 'messageChannelMessageAssociation',
    channelIdColumnName: 'messageChannelId',
    coreChannelTableName: 'messageChannel',
  },
] as const;

@RegisteredWorkspaceCommand('2.63.0', 1795432675597)
@Command({
  name: 'upgrade:2-63:add-channel-association-account-owner-and-handle',
  description:
    'Add the account owner relation and the channel handle to calendar and message channel associations and backfill them from each channel',
})
export class AddChannelAssociationAccountOwnerAndHandleCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const missingObjectUniversalIdentifier = [
      STANDARD_OBJECTS.calendarChannelEventAssociation.universalIdentifier,
      STANDARD_OBJECTS.messageChannelMessageAssociation.universalIdentifier,
      STANDARD_OBJECTS.workspaceMember.universalIdentifier,
    ].find(
      (objectUniversalIdentifier) =>
        !isDefined(
          flatObjectMetadataMaps.byUniversalIdentifier[
            objectUniversalIdentifier
          ],
        ),
    );

    if (isDefined(missingObjectUniversalIdentifier)) {
      this.logger.warn(
        `Object ${missingObjectUniversalIdentifier} not found for workspace ${workspaceId}, skipping account owner and handle creation`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });
    const allFlatEntityOperationByMetadataName = {
      fieldMetadata: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatFieldMetadataMaps,
            existingFlatEntityMaps: flatFieldMetadataMaps,
            universalIdentifiers: FIELD_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      index: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatIndexMetadata>({
            standardFlatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
            existingFlatEntityMaps: flatIndexMaps,
            universalIdentifiers: ACCOUNT_OWNER_INDEX_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
    };
    const fieldCount =
      allFlatEntityOperationByMetadataName.fieldMetadata.flatEntityToCreate
        .length;
    const indexCount =
      allFlatEntityOperationByMetadataName.index.flatEntityToCreate.length;
    const creationSummary = `${fieldCount} field(s) and ${indexCount} index(es)`;

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${creationSummary} and backfill account owners and handles for workspace ${workspaceId}`,
      );

      return;
    }

    if (fieldCount + indexCount > 0) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            shouldDeferActions: false,
            allFlatEntityOperationByMetadataName,
            workspaceId,
            isSystemBuild: true,
            applicationUniversalIdentifier:
              twentyStandardFlatApplication.universalIdentifier,
          },
        );

      if (result.status === 'fail') {
        throw new Error(
          `Failed to create the channel association account owner and handle for workspace ${workspaceId}: ${JSON.stringify(result, null, 2)}`,
        );
      }

      this.logger.log(
        `Created ${creationSummary} for workspace ${workspaceId}`,
      );
    }

    for (const associationBackfill of ASSOCIATION_BACKFILLS) {
      await this.backfillAssociationSources({
        workspaceId,
        ...associationBackfill,
      });
    }
  }

  private async backfillAssociationSources({
    workspaceId,
    associationTableName,
    channelIdColumnName,
    coreChannelTableName,
  }: {
    workspaceId: string;
    associationTableName: string;
    channelIdColumnName: string;
    coreChannelTableName: string;
  }): Promise<void> {
    const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

    // A member who left and rejoined keeps a soft-deleted row beside the live one
    const channelSources = await this.dataSource.query<
      { channelId: string; handle: string; workspaceMemberId: string | null }[]
    >(
      `SELECT channel.id AS "channelId", channel.handle AS "handle", member.id AS "workspaceMemberId"
       FROM core.${escapeIdentifier(coreChannelTableName)} channel
       JOIN core."connectedAccount" account ON account.id = channel."connectedAccountId"
       JOIN core."userWorkspace" "userWorkspace" ON "userWorkspace".id = account."userWorkspaceId"
       LEFT JOIN ${schemaName}."workspaceMember" member
         ON member."userId" = "userWorkspace"."userId" AND member."deletedAt" IS NULL
       WHERE channel."workspaceId" = $1`,
      [workspaceId],
    );

    const associationTable = `${schemaName}.${escapeIdentifier(associationTableName)}`;
    const channelIdColumn = escapeIdentifier(channelIdColumnName);
    let updatedCount = 0;

    for (const { channelId, handle, workspaceMemberId } of channelSources) {
      let batchCount: number;

      // A channel whose owner left has no member to record, so the handle marks the rows already done
      do {
        [, batchCount] = await this.dataSource.query<[unknown[], number]>(
          `UPDATE ${associationTable}
           SET "accountOwnerId" = $1, "handle" = $2
           WHERE id IN (
             SELECT id FROM ${associationTable}
             WHERE ${channelIdColumn} = $3 AND "handle" IS NULL
             LIMIT ${BACKFILL_BATCH_SIZE}
           )`,
          [workspaceMemberId, handle, channelId],
        );

        updatedCount += batchCount;
      } while (batchCount === BACKFILL_BATCH_SIZE);
    }

    this.logger.log(
      `Workspace ${workspaceId}: backfilled the account owner and handle of ${updatedCount} ${associationTableName} row(s)`,
    );
  }
}
