import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { linkLegacyChatOwnersAndSendersToWorkspaceMembers } from 'src/database/commands/upgrade-version-command/2-47/utils/link-legacy-chat-owners-and-senders-to-workspace-members.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// Kept as literals because the entries they used to name have been removed
// from the standard objects in the same change.
const CHAT_THREAD_USER_WORKSPACE_ID_FIELD_UNIVERSAL_IDENTIFIER =
  'bf830886-b6dc-46e9-a229-eecbb0e66032';
const CHAT_THREAD_LAST_STREAM_ERROR_FIELD_UNIVERSAL_IDENTIFIER =
  '2e389238-ba5c-4951-83d4-b14f94592c5c';
const CHAT_MESSAGE_SENDER_USER_WORKSPACE_ID_FIELD_UNIVERSAL_IDENTIFIER =
  'f4184c3a-b85c-4cef-8181-b2fefdf98fda';
const CHAT_MESSAGE_IS_HIDDEN_FIELD_UNIVERSAL_IDENTIFIER =
  'be06f3d5-edb4-4243-89ad-71810b79b319';
const CHAT_THREAD_OWNER_INDEX_UNIVERSAL_IDENTIFIER =
  'c97a4c97-266b-490a-a4d6-76274f5de429';
const CHAT_MESSAGE_HIDDEN_KICKOFF_INDEX_UNIVERSAL_IDENTIFIER =
  '1d423c31-007a-4fcd-8514-dcb1f7a8fa78';

// Chats are owned and sent by workspace members, failed turns hold their own
// error and hidden kickoffs became system messages, so the columns those
// replaced go
@RegisteredWorkspaceCommand('2.47.0', 1791730401449)
@Command({
  name: 'upgrade:2-47:drop-legacy-chat-columns',
  description:
    'Drop the chat membership, last stream error and hidden message columns',
})
export class DropLegacyChatColumnsCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const findField = (universalIdentifier: string) =>
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier,
      });
    const threadOwnerField = findField(
      CHAT_THREAD_USER_WORKSPACE_ID_FIELD_UNIVERSAL_IDENTIFIER,
    );
    const messageSenderField = findField(
      CHAT_MESSAGE_SENDER_USER_WORKSPACE_ID_FIELD_UNIVERSAL_IDENTIFIER,
    );
    const fieldsToDelete = [
      threadOwnerField,
      findField(CHAT_THREAD_LAST_STREAM_ERROR_FIELD_UNIVERSAL_IDENTIFIER),
      messageSenderField,
      findField(CHAT_MESSAGE_IS_HIDDEN_FIELD_UNIVERSAL_IDENTIFIER),
    ].filter(isDefined);
    const indexesToDelete = [
      CHAT_THREAD_OWNER_INDEX_UNIVERSAL_IDENTIFIER,
      CHAT_MESSAGE_HIDDEN_KICKOFF_INDEX_UNIVERSAL_IDENTIFIER,
    ]
      .map((universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatIndexMetadata>({
          flatEntityMaps: flatIndexMaps,
          universalIdentifier,
        }),
      )
      .filter(isDefined);

    if (fieldsToDelete.length === 0 && indexesToDelete.length === 0) {
      this.logger.log(
        `Legacy chat columns already dropped for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would drop ${fieldsToDelete.length} legacy chat field(s) and ${indexesToDelete.length} index(es) for workspace ${workspaceId}`,
      );

      return;
    }

    await linkLegacyChatOwnersAndSendersToWorkspaceMembers({
      dataSource: this.dataSource,
      workspaceId,
      hasThreadOwner: isDefined(threadOwnerField),
      hasMessageSender: isDefined(messageSenderField),
    });

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
            index: {
              flatEntityToCreate: [],
              flatEntityToDelete: indexesToDelete,
              flatEntityToUpdate: [],
            },
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: fieldsToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to drop legacy chat columns for workspace ${workspaceId}: ${JSON.stringify(result, null, 2)}`,
      );
    }

    this.logger.log(
      `Dropped ${fieldsToDelete.length} legacy chat field(s) and ${indexesToDelete.length} index(es) for workspace ${workspaceId}`,
    );
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {
    // The standard objects no longer declare these columns, and their data has
    // moved to the member, turn and system message columns that replaced them.
  }
}
