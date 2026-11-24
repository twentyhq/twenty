import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CHANNEL_ASSOCIATION_SOURCE_FIELD_UNIVERSAL_IDENTIFIERS = [
  'c87b6c5a-d761-4d8f-b62e-af459a11ba1f',
  'f3a2e285-abb7-44c5-a4bf-06a44101a33f',
  'a54a940b-d839-4c47-a02c-5bab7e300841',
  'ff274ea7-69e0-4d54-9389-8ec8f14c7073',
  '56aec2c7-5ae1-413c-81e8-880623b8f8b2',
  'cfe10518-02e1-456f-a41a-0cc99b1686fe',
];

const CHANNEL_ASSOCIATION_ACCOUNT_OWNER_INDEX_UNIVERSAL_IDENTIFIERS = [
  '740776d1-fe14-41b9-80b9-11c610765f0c',
  '0797b417-8f87-4df1-b838-d85fbb663110',
];

@RegisteredWorkspaceCommand('2.64.0', 1795541015901)
@Command({
  name: 'upgrade:2-64:remove-channel-association-account-owner-and-handle',
  description:
    'Remove the account owner relation and the channel handle from calendar and message channel associations',
})
export class RemoveChannelAssociationAccountOwnerAndHandleCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const fieldsToDelete =
      CHANNEL_ASSOCIATION_SOURCE_FIELD_UNIVERSAL_IDENTIFIERS.map(
        (universalIdentifier) =>
          findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
            flatEntityMaps: flatFieldMetadataMaps,
            universalIdentifier,
          }),
      ).filter(isDefined);
    const indexesToDelete =
      CHANNEL_ASSOCIATION_ACCOUNT_OWNER_INDEX_UNIVERSAL_IDENTIFIERS.map(
        (universalIdentifier) =>
          findFlatEntityByUniversalIdentifier<FlatIndexMetadata>({
            flatEntityMaps: flatIndexMaps,
            universalIdentifier,
          }),
      ).filter(isDefined);

    if (fieldsToDelete.length === 0 && indexesToDelete.length === 0) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would delete ${fieldsToDelete.length} field(s) and ${indexesToDelete.length} index(es) for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          shouldDeferActions: false,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
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
      throw new WorkspaceMigrationBuilderException(result);
    }

    this.logger.log(
      `Deleted ${fieldsToDelete.length} field(s) and ${indexesToDelete.length} index(es) for workspace ${workspaceId}`,
    );
  }
}
