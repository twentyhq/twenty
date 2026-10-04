import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const getTables = (workspaceId: string) => {
  const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

  return {
    participant: `${schema}."agentChatThreadParticipant"`,
    recordShare: `${schema}."recordShare"`,
    workspaceMember: `${schema}."workspaceMember"`,
  };
};

// Every row a member of the workspace still holds gets the grant that lets
// them, and only them, read it
const insertParticipantOwnerShares = async ({
  manager,
  workspaceId,
  participantObjectMetadataId,
}: {
  manager: EntityManager;
  workspaceId: string;
  participantObjectMetadataId: string;
}): Promise<number> => {
  const tables = getTables(workspaceId);

  const inserted: { id: string }[] = await manager.query(
    `INSERT INTO ${tables.recordShare}
       ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
     SELECT $1, participant.id, participant."workspaceMemberId", 'WORKSPACE_MEMBER', 'FULL', 'OWNER', participant.id
     FROM ${tables.participant} participant
     JOIN ${tables.workspaceMember} member
       ON member.id = participant."workspaceMemberId" AND member."deletedAt" IS NULL
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [participantObjectMetadataId],
  );

  return inserted.length;
};

const deleteParticipantOwnerShares = async ({
  manager,
  workspaceId,
  participantObjectMetadataId,
}: {
  manager: EntityManager;
  workspaceId: string;
  participantObjectMetadataId: string;
}): Promise<number> => {
  const tables = getTables(workspaceId);

  const [, deletedCount]: [unknown[], number] = await manager.query(
    `DELETE FROM ${tables.recordShare}
     WHERE "objectMetadataId" = $1 AND "rowCause" = 'OWNER'`,
    [participantObjectMetadataId],
  );

  return deletedCount;
};

@RegisteredWorkspaceCommand('2.46.0', 1791056679663)
@Command({
  name: 'upgrade:2-46:make-agent-chat-thread-participants-private',
  description:
    "Grant every chat participant row to its member and make the object PRIVATE, so a member's inbox state reaches their open apps through record events",
})
export class MakeAgentChatThreadParticipantsPrivateCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly storage: AgentHistoryUpgradeStorageService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  // Grants first, so the object is never PRIVATE with rows nobody can read
  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const participantObject = await this.findParticipantObject(workspaceId);

    if (!isDefined(participantObject)) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would grant chat participants to their members and make them PRIVATE for workspace ${workspaceId}`,
      );

      return;
    }

    const grantCount = await this.storage.run(workspaceId, ({ manager }) =>
      insertParticipantOwnerShares({
        manager,
        workspaceId,
        participantObjectMetadataId: participantObject.id,
      }),
    );

    await this.setReadability({
      workspaceId,
      participantObject,
      readability: MetadataReadability.PRIVATE,
    });

    this.logger.log(
      `Workspace ${workspaceId}: granted ${grantCount} chat participant row(s) to their members and made the object PRIVATE`,
    );
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const participantObject = await this.findParticipantObject(workspaceId);

    if (!isDefined(participantObject)) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would make chat participants SYSTEM again and remove their grants for workspace ${workspaceId}`,
      );

      return;
    }

    await this.setReadability({
      workspaceId,
      participantObject,
      readability: MetadataReadability.SYSTEM,
    });

    const deletedCount = await this.storage.run(workspaceId, ({ manager }) =>
      deleteParticipantOwnerShares({
        manager,
        workspaceId,
        participantObjectMetadataId: participantObject.id,
      }),
    );

    this.logger.log(
      `Workspace ${workspaceId}: made chat participants SYSTEM again and removed ${deletedCount} grant(s)`,
    );
  }

  private async findParticipantObject(
    workspaceId: string,
  ): Promise<FlatObjectMetadata | undefined> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const participantObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier
      ];

    if (!isDefined(participantObject)) {
      this.logger.log(
        `agentChatThreadParticipant object not found for workspace ${workspaceId}, skipping`,
      );
    }

    return participantObject;
  }

  private async setReadability({
    workspaceId,
    participantObject,
    readability,
  }: {
    workspaceId: string;
    participantObject: FlatObjectMetadata;
    readability: MetadataReadability;
  }): Promise<void> {
    if (participantObject.readability === readability) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            objectMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [
                {
                  ...participantObject,
                  readability,
                  updatedAt: new Date().toISOString(),
                },
              ],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
