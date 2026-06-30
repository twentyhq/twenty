import { Command } from 'nest-commander';

import { InjectRepository } from '@nestjs/typeorm';
import { getIndexUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { getMetadataSerializedRelationNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-serialized-relation-names.util';
import { isSystemUniqueFlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/utils/is-system-unique-flat-index-metadata.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// The metadata side-effect engine is now the sole owner of the single-field unique index backing
// a unique scalar field, and it resolves that index by its deterministic universal identifier.
// Indexes created on the metadata API path before this change were given a random universal
// identifier, so the engine would fail to locate (and therefore update/delete) them. This command
// rewrites their universal identifier to the deterministic value so the engine can manage them.
@RegisteredWorkspaceCommand('2.17.0', 1801000030000)
@Command({
  name: 'upgrade:2-17:backfill-system-unique-index-universal-identifier',
  description:
    'Backfill the deterministic universal identifier of system unique indexes (the index backing a unique scalar field) so the metadata side-effect engine can own their lifecycle.',
})
export class BackfillSystemUniqueIndexUniversalIdentifierCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    // IndexMetadataEntity is a core metadata entity (like FieldMetadataEntity / ObjectMetadataEntity),
    // not a workspace-scoped table, so it has no workspace-scoped repository wrapper.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(IndexMetadataEntity)
    private readonly indexMetadataRepository: Repository<IndexMetadataEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatObjectMetadataMaps, flatIndexMaps, flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatIndexMaps',
        'flatApplicationMaps',
      ]);

    const indexesToBackfill = Object.values(flatIndexMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(isSystemUniqueFlatIndexMetadata)
      .flatMap((flatIndexMetadata) => {
        const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: flatIndexMetadata.objectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        });

        if (
          !isDefined(flatObjectMetadata) ||
          !isDefined(flatObjectMetadata.applicationId)
        ) {
          return [];
        }

        const applicationUniversalIdentifier =
          flatApplicationMaps.byId[flatObjectMetadata.applicationId]
            ?.universalIdentifier;

        if (!isDefined(applicationUniversalIdentifier)) {
          return [];
        }

        const deterministicUniversalIdentifier = getIndexUniversalIdentifier({
          applicationUniversalIdentifier,
          objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
          name: flatIndexMetadata.name,
        });

        if (
          deterministicUniversalIdentifier === flatIndexMetadata.universalIdentifier
        ) {
          return [];
        }

        return [
          {
            id: flatIndexMetadata.id,
            name: flatIndexMetadata.name,
            deterministicUniversalIdentifier,
          },
        ];
      });

    if (indexesToBackfill.length === 0) {
      this.logger.log(
        `No system unique index universal identifier to backfill for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Backfilling ${indexesToBackfill.length} system unique index universal identifier(s) for workspace ${workspaceId}: ${indexesToBackfill.map(({ name }) => name).join(', ')}`,
    );

    if (isDryRun) {
      return;
    }

    for (const { id, deterministicUniversalIdentifier } of indexesToBackfill) {
      await this.indexMetadataRepository.update(
        { id, workspaceId },
        { universalIdentifier: deterministicUniversalIdentifier },
      );
    }

    const indexRelatedMetadataNames = [
      'index',
      ...getMetadataRelatedMetadataNames('index'),
      ...getMetadataSerializedRelationNames('index'),
    ] as const;
    const cacheKeysToFlush = [
      ...new Set(indexRelatedMetadataNames.map(getMetadataFlatEntityMapsKey)),
    ];

    await this.workspaceCacheService.flush(workspaceId, cacheKeysToFlush);

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );

    this.logger.log(
      `Backfilled ${indexesToBackfill.length} system unique index universal identifier(s) for workspace ${workspaceId}`,
    );
  }
}
