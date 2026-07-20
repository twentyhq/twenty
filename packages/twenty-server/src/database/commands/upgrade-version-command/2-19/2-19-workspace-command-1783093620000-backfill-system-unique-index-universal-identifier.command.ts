import { Command } from 'nest-commander';

import { InjectRepository } from '@nestjs/typeorm';
import { getIndexUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { getMetadataSerializedRelationNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-serialized-relation-names.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { isPrimaryKeyFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-primary-key-flat-field-metadata.util';
import { isSystemUniqueFlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/utils/is-system-unique-flat-index-metadata.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.19.0', 1783093620000)
@Command({
  name: 'upgrade:2-19:backfill-system-unique-index-universal-identifier',
  description:
    'Backfill the deterministic universal identifier of system unique indexes (the index backing a unique scalar field) so the metadata side-effect engine can own their lifecycle.',
})
export class BackfillSystemUniqueIndexUniversalIdentifierCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
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

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      flatApplicationMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatApplicationMaps',
    ]);

    const backingFlatIndexMetadataByFieldMetadataId = new Map(
      Object.values(flatIndexMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter(
          (flatIndexMetadata) =>
            isSystemUniqueFlatIndexMetadata(flatIndexMetadata) &&
            flatIndexMetadata.flatIndexFieldMetadatas.length === 1,
        )
        .map((flatIndexMetadata): [string, typeof flatIndexMetadata] => [
          flatIndexMetadata.flatIndexFieldMetadatas[0].fieldMetadataId,
          flatIndexMetadata,
        ]),
    );

    const indexesToBackfill = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatFieldMetadata) =>
          flatFieldMetadata.isUnique === true &&
          !isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) &&
          !isPrimaryKeyFlatFieldMetadata(flatFieldMetadata),
      )
      .flatMap((flatFieldMetadata) => {
        const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: flatFieldMetadata.objectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        });

        if (
          !isDefined(flatObjectMetadata) ||
          !isDefined(flatFieldMetadata.applicationId)
        ) {
          return [];
        }

        const applicationUniversalIdentifier =
          flatApplicationMaps.byId[flatFieldMetadata.applicationId]
            ?.universalIdentifier;

        if (!isDefined(applicationUniversalIdentifier)) {
          return [];
        }

        const backingFlatIndexMetadata =
          backingFlatIndexMetadataByFieldMetadataId.get(flatFieldMetadata.id);

        if (!isDefined(backingFlatIndexMetadata)) {
          return [];
        }

        const deterministicUniversalIdentifier = getIndexUniversalIdentifier({
          applicationUniversalIdentifier,
          objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
          name: backingFlatIndexMetadata.name,
        });

        if (
          deterministicUniversalIdentifier ===
          backingFlatIndexMetadata.universalIdentifier
        ) {
          return [];
        }

        return [
          {
            id: backingFlatIndexMetadata.id,
            name: backingFlatIndexMetadata.name,
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
