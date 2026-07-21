import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { PARTIAL_SYSTEM_FLAT_FIELD_METADATAS } from 'src/engine/metadata-modules/object-metadata/constants/partial-system-flat-field-metadatas.constant';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const SYSTEM_FIELD_NAMES = new Set<string>([
  PARTIAL_SYSTEM_FLAT_FIELD_METADATAS.id.name,
  PARTIAL_SYSTEM_FLAT_FIELD_METADATAS.createdAt.name,
  PARTIAL_SYSTEM_FLAT_FIELD_METADATAS.updatedAt.name,
  PARTIAL_SYSTEM_FLAT_FIELD_METADATAS.deletedAt.name,
  PARTIAL_SYSTEM_FLAT_FIELD_METADATAS.createdBy.name,
  PARTIAL_SYSTEM_FLAT_FIELD_METADATAS.updatedBy.name,
  PARTIAL_SYSTEM_FLAT_FIELD_METADATAS.position.name,
  PARTIAL_SYSTEM_FLAT_FIELD_METADATAS.searchVector.name,
]);

@RegisteredWorkspaceCommand('2.21.0', 1783925862946)
@Command({
  name: 'upgrade:2-21:backfill-system-field-is-system-side-effect',
  description:
    'Flag existing system fields (id, createdAt, updatedAt, deletedAt, createdBy, updatedBy, position, searchVector) as isSystemSideEffect: true so manifest sync deletion inference excludes them.',
})
export class BackfillSystemFieldIsSystemSideEffectCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const applications = await this.applicationRepository.find({
      select: ['id', 'universalIdentifier'],
      where: { workspaceId },
      withDeleted: true,
    });
    const applicationUniversalIdentifierById = new Map(
      applications.map((application) => [
        application.id,
        application.universalIdentifier,
      ]),
    );

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const fieldMetadataIdsToFlag: string[] = [];

    for (const flatFieldMetadata of Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(flatFieldMetadata) ||
        !SYSTEM_FIELD_NAMES.has(flatFieldMetadata.name) ||
        flatFieldMetadata.isSystemSideEffect
      ) {
        continue;
      }

      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatObjectMetadataMaps,
        flatEntityId: flatFieldMetadata.objectMetadataId,
      });
      const applicationUniversalIdentifier =
        applicationUniversalIdentifierById.get(flatFieldMetadata.applicationId);

      if (
        !isDefined(flatObjectMetadata) ||
        !isDefined(applicationUniversalIdentifier)
      ) {
        this.logger.warn(
          `Missing object or application for field ${flatFieldMetadata.name} (${flatFieldMetadata.id}) in workspace ${workspaceId}, skipping`,
        );
        continue;
      }

      const systemFieldUniversalIdentifier = getFieldUniversalIdentifier({
        applicationUniversalIdentifier,
        objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
        name: flatFieldMetadata.name,
      });

      if (
        systemFieldUniversalIdentifier !== flatFieldMetadata.universalIdentifier
      ) {
        this.logger.warn(
          `System field ${flatFieldMetadata.name} (${flatFieldMetadata.id}) does not carry its deterministic universal identifier in workspace ${workspaceId}, skipping`,
        );

        continue;
      }

      fieldMetadataIdsToFlag.push(flatFieldMetadata.id);
    }

    if (fieldMetadataIdsToFlag.length === 0) {
      this.logger.log(
        `No system field isSystemSideEffect flag to backfill for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Flagging ${fieldMetadataIdsToFlag.length} system field(s) as isSystemSideEffect for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    await this.fieldMetadataRepository.update(
      { id: In(fieldMetadataIdsToFlag), workspaceId },
      { isSystemSideEffect: true },
    );

    await this.workspaceMigrationRunnerService.invalidateCache({
      allFlatEntityMapsKeys: [getMetadataFlatEntityMapsKey('fieldMetadata')],
      workspaceId,
    });

    this.logger.log(
      `Flagged ${fieldMetadataIdsToFlag.length} system field(s) as isSystemSideEffect for workspace ${workspaceId}`,
    );
  }
}
