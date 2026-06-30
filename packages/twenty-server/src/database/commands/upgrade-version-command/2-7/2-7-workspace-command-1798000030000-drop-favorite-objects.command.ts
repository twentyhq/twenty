import { Command } from 'nest-commander';

import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Hard-coded because the matching STANDARD_OBJECTS entries no longer exist
// in twenty-shared after the favorite → navigationMenuItem migration.
const FAVORITE_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-ab56-4e05-92a3-e2414a499860';
const FAVORITE_FOLDER_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-7cf8-401f-8211-a9587d27fd2d';

// favorite has a relation to favoriteFolder, so it must be deleted first to
// avoid leaving dangling relation fields when favoriteFolder is dropped.
const LEGACY_FAVORITE_OBJECTS: Array<{
  universalIdentifier: string;
  label: string;
}> = [
  {
    universalIdentifier: FAVORITE_OBJECT_UNIVERSAL_IDENTIFIER,
    label: 'favorite',
  },
  {
    universalIdentifier: FAVORITE_FOLDER_OBJECT_UNIVERSAL_IDENTIFIER,
    label: 'favoriteFolder',
  },
];

@RegisteredWorkspaceCommand('2.7.0', 1798000030000)
@Command({
  name: 'upgrade:2-7:drop-favorite-objects',
  description:
    'Drop leftover favorite and favoriteFolder object metadata and workspace tables (data was migrated to navigationMenuItem in 1.17/1.18)',
})
export class DropFavoriteObjectsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Starting legacy favorite objects removal for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    for (const { universalIdentifier, label } of LEGACY_FAVORITE_OBJECTS) {
      const flatObjectMetadata =
        findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier,
        });

      if (!isDefined(flatObjectMetadata)) {
        this.logger.log(
          `${label} object already absent for workspace ${workspaceId}`,
        );
        continue;
      }

      if (isDryRun) {
        this.logger.log(
          `[DRY RUN] Would delete ${label} object (id=${flatObjectMetadata.id}) for workspace ${workspaceId}`,
        );
        continue;
      }

      await this.objectMetadataService.deleteOneObject({
        deleteObjectInput: { id: flatObjectMetadata.id },
        workspaceId,
        isSystemBuild: true,
        ownerFlatApplication: twentyStandardFlatApplication,
      });

      this.logger.log(`Deleted ${label} object for workspace ${workspaceId}`);
    }
  }
}
