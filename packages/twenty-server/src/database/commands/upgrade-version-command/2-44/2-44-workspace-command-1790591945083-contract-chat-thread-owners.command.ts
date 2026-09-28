import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  computeLegacyChatOwnerStandardMetadata,
  LEGACY_CHAT_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
  LEGACY_CHAT_OWNER_INDEX_UNIVERSAL_IDENTIFIER,
} from 'src/database/commands/upgrade-version-command/2-44/utils/compute-twenty-standard-application-all-flat-entity-maps-pre-2-44-chat-owner.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const MEMBER_FIELD =
  STANDARD_OBJECTS.agentChatThread.fields.workspaceMember.universalIdentifier;

@RegisteredWorkspaceCommand('2.44.0', 1790591945083)
@Command({
  name: 'upgrade:2-44:contract-chat-thread-owners',
  description:
    'Backfill workspace member chat owners and remove the legacy owner scalar',
})
export class ContractChatThreadOwnersCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly storage: AgentHistoryUpgradeStorageService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);
    const thread =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];
    if (!isDefined(thread)) return;
    const member = flatFieldMetadataMaps.byUniversalIdentifier[MEMBER_FIELD];
    if (!isDefined(member))
      throw new Error(
        'Complete the 2.43 workspace member owner expansion before contracting chat owners',
      );
    const legacy =
      flatFieldMetadataMaps.byUniversalIdentifier[
        LEGACY_CHAT_OWNER_FIELD_UNIVERSAL_IDENTIFIER
      ];
    const legacyIndex =
      flatIndexMaps.byUniversalIdentifier[
        LEGACY_CHAT_OWNER_INDEX_UNIVERSAL_IDENTIFIER
      ];
    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would backfill chat owners, delete threads whose owner left and remove userWorkspaceId in workspace ${workspaceId}`,
      );
      return;
    }
    const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    if (isDefined(legacy)) {
      await this.storage.run(workspaceId, async ({ manager }) => {
        await manager.query(
          `UPDATE ${schema}."agentChatThread" thread SET "workspaceMemberId" = member.id
          FROM core."userWorkspace" membership JOIN ${schema}."workspaceMember" member ON member."userId" = membership."userId" AND member."deletedAt" IS NULL
          WHERE membership.id = thread."userWorkspaceId" AND membership."workspaceId" = $1 AND thread."workspaceMemberId" IS NULL`,
          [workspaceId],
        );
        // Only threads a person owned lose their owner here: a thread without
        // a legacy owner belongs to something else, such as a workflow run.
        const ownerLeft = `thread."userWorkspaceId" IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM ${schema}."workspaceMember" member WHERE member.id = thread."workspaceMemberId" AND member."deletedAt" IS NULL)`;
        // Shares have polymorphic record IDs and are not removed by the thread FK cascade.
        await manager.query(
          `DELETE FROM ${schema}."recordShare" share USING ${schema}."agentChatThread" thread
          WHERE share."recordId" = thread.id AND share."objectMetadataId" = $1 AND ${ownerLeft}`,
          [thread.id],
        );
        await manager.query(
          `DELETE FROM ${schema}."agentChatThread" thread WHERE ${ownerLeft}`,
        );
      });
    }
    await this.migrate(workspaceId, {
      deleteFields: isDefined(legacy) ? [legacy] : [],
      deleteIndexes: isDefined(legacyIndex) ? [legacyIndex] : [],
    });
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);
    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThread.universalIdentifier
        ],
      )
    )
      return;
    const member = flatFieldMetadataMaps.byUniversalIdentifier[MEMBER_FIELD];
    if (!isDefined(member))
      throw new Error('Chat workspace member owner field is missing');
    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would restore and backfill the legacy chat owner column in workspace ${workspaceId}; deleted orphan history cannot be recovered`,
      );
      return;
    }
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const { allFlatEntityMaps } = computeLegacyChatOwnerStandardMetadata({
      workspaceId,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
      now: new Date().toISOString(),
    });
    const existingLegacy =
      flatFieldMetadataMaps.byUniversalIdentifier[
        LEGACY_CHAT_OWNER_FIELD_UNIVERSAL_IDENTIFIER
      ];
    const legacy =
      existingLegacy ??
      allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        LEGACY_CHAT_OWNER_FIELD_UNIVERSAL_IDENTIFIER
      ]!;
    await this.migrate(workspaceId, {
      createFields: isDefined(existingLegacy)
        ? []
        : [{ ...legacy, isNullable: true }],
      createIndexes: isDefined(
        flatIndexMaps.byUniversalIdentifier[
          LEGACY_CHAT_OWNER_INDEX_UNIVERSAL_IDENTIFIER
        ],
      )
        ? []
        : [
            allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
              LEGACY_CHAT_OWNER_INDEX_UNIVERSAL_IDENTIFIER
            ]!,
          ],
    });
    const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    await this.dataSource.query(
      `UPDATE ${schema}."agentChatThread" thread SET "userWorkspaceId" = membership.id
      FROM ${schema}."workspaceMember" member JOIN core."userWorkspace" membership ON membership."userId" = member."userId" AND membership."workspaceId" = $1 AND membership."deletedAt" IS NULL
      WHERE thread."workspaceMemberId" = member.id AND thread."userWorkspaceId" IS NULL`,
      [workspaceId],
    );
    const ownerlessThreads: { id: string }[] = await this.dataSource.query(
      `SELECT id FROM ${schema}."agentChatThread" WHERE "userWorkspaceId" IS NULL LIMIT 1`,
    );
    if (ownerlessThreads.length > 0) {
      throw new Error(
        `Cannot restore required legacy chat owners for ${workspaceId}: a surviving thread has no active membership. Restore its membership and retry the rollback.`,
      );
    }
    const { flatFieldMetadataMaps: restoredFields } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);
    const restoredLegacy =
      restoredFields.byUniversalIdentifier[
        LEGACY_CHAT_OWNER_FIELD_UNIVERSAL_IDENTIFIER
      ];
    if (!isDefined(restoredLegacy))
      throw new Error('Legacy owner field was not restored');
    await this.migrate(workspaceId, {
      updateFields: [
        {
          ...restoredLegacy,
          isNullable: false,
          updatedAt: new Date().toISOString(),
        },
      ],
    });
  }

  private async migrate(
    workspaceId: string,
    {
      createFields = [],
      updateFields = [],
      deleteFields = [],
      createIndexes = [],
      deleteIndexes = [],
    }: {
      createFields?: FlatFieldMetadata[];
      updateFields?: FlatFieldMetadata[];
      deleteFields?: FlatFieldMetadata[];
      createIndexes?: FlatIndexMetadata[];
      deleteIndexes?: FlatIndexMetadata[];
    },
  ): Promise<void> {
    if (
      createFields.length +
        updateFields.length +
        deleteFields.length +
        createIndexes.length +
        deleteIndexes.length ===
      0
    )
      return;
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: createFields,
              flatEntityToUpdate: updateFields,
              flatEntityToDelete: deleteFields,
            },
            index: {
              flatEntityToCreate: createIndexes,
              flatEntityToUpdate: [],
              flatEntityToDelete: deleteIndexes,
            },
          },
        },
      );
    if (result.status === 'fail')
      throw new Error(
        `Failed to migrate chat owner metadata in workspace ${workspaceId}: ${JSON.stringify(result)}`,
      );
  }
}
