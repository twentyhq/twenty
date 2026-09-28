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
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const WORKSPACE_MEMBER_OWNER_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatThread.fields.workspaceMember.universalIdentifier,
  STANDARD_OBJECTS.workspaceMember.fields.agentChatThreads.universalIdentifier,
];

const WORKSPACE_MEMBER_OWNER_INDEX_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatThread.indexes.workspaceMemberIndex
    .universalIdentifier,
];

// Expand step of the chat thread owner move. The legacy userWorkspaceId column
// stays untouched so servers that still read it keep working; the contract
// step removes it (twentyhq/core-team-issues#2925).
@RegisteredWorkspaceCommand('2.43.0', 1790360612188)
@Command({
  name: 'upgrade:2-43:link-chat-threads-to-workspace-members',
  description:
    'Add the chat thread workspaceMember owner and backfill it from userWorkspaceId',
})
export class LinkChatThreadsToWorkspaceMembersCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    // Workspaces without chat history objects get the new shape when the
    // 2.42 history move provisions them.
    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThread.universalIdentifier
        ],
      )
    ) {
      this.logger.log(
        `agentChatThread object not found for workspace ${workspaceId}, skipping`,
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
            universalIdentifiers:
              WORKSPACE_MEMBER_OWNER_FIELD_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      index: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatIndexMetadata>({
            standardFlatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
            existingFlatEntityMaps: flatIndexMaps,
            universalIdentifiers:
              WORKSPACE_MEMBER_OWNER_INDEX_UNIVERSAL_IDENTIFIERS,
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

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${fieldCount} field(s) and ${indexCount} index(es), then link chat threads to workspace members for workspace ${workspaceId}`,
      );

      return;
    }

    if (fieldCount + indexCount > 0) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            allFlatEntityOperationByMetadataName,
            workspaceId,
            isSystemBuild: true,
            applicationUniversalIdentifier:
              twentyStandardFlatApplication.universalIdentifier,
          },
        );

      if (result.status === 'fail') {
        throw new Error(
          `Failed to create the chat thread workspace member owner for workspace ${workspaceId}: ${JSON.stringify(result, null, 2)}`,
        );
      }
    }

    const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    const [, linkedCount]: [unknown[], number] = await this.dataSource.query(
      `UPDATE ${schemaName}."agentChatThread" thread
       SET "workspaceMemberId" = member.id
       FROM core."userWorkspace" membership
       JOIN ${schemaName}."workspaceMember" member
         ON member."userId" = membership."userId" AND member."deletedAt" IS NULL
       WHERE membership.id = thread."userWorkspaceId"
         AND membership."workspaceId" = $1
         AND thread."workspaceMemberId" IS NULL`,
      [workspaceId],
    );

    this.logger.log(
      `Linked ${linkedCount} chat thread(s) to workspace members for workspace ${workspaceId}`,
    );
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {
    // The expand step only adds data next to the untouched legacy column.
  }
}
