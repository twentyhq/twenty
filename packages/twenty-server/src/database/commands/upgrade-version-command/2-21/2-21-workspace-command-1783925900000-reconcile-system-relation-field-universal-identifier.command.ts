import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { getSystemRelationFieldUniversalIdentifier } from 'twenty-shared/application';
import {
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const REVERSE_SYSTEM_RELATION_FIELD_NAME_PREFIX = 'target';

// Universal identifiers of the four standard relation objects that host the
// reverse morph fields of every default relation.
const DEFAULT_RELATION_OBJECT_UNIVERSAL_IDENTIFIERS = new Set<string>(
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.map(
    (standardObjectNameSingular) =>
      STANDARD_OBJECTS[standardObjectNameSingular].universalIdentifier,
  ),
);

type ReverseFieldUniversalIdentifierUpdate = {
  id: string;
  universalIdentifier: string;
};

@RegisteredWorkspaceCommand('2.21.0', 1783925900000)
@Command({
  name: 'upgrade:2-21:reconcile-system-relation-field-universal-identifier',
  description:
    'Re-own the reverse morph fields of default relations (timelineActivity/attachment/noteTarget/taskTarget) to their name-free deterministic universal identifier and flag them isSystemSideEffect: true, so an object rename becomes a lossless update and the engine owns their lifecycle.',
})
export class ReconcileSystemRelationFieldUniversalIdentifierCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
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

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const universalIdentifierUpdates: ReverseFieldUniversalIdentifierUpdate[] =
      [];
    const fieldMetadataIdsToFlagOnly: string[] = [];

    for (const flatFieldMetadata of Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(flatFieldMetadata) ||
        flatFieldMetadata.type !== FieldMetadataType.MORPH_RELATION ||
        !flatFieldMetadata.name.startsWith(
          REVERSE_SYSTEM_RELATION_FIELD_NAME_PREFIX,
        ) ||
        !isDefined(flatFieldMetadata.relationTargetObjectMetadataId)
      ) {
        continue;
      }

      const hostFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatObjectMetadataMaps,
        flatEntityId: flatFieldMetadata.objectMetadataId,
      });

      if (
        !isDefined(hostFlatObjectMetadata) ||
        !DEFAULT_RELATION_OBJECT_UNIVERSAL_IDENTIFIERS.has(
          hostFlatObjectMetadata.universalIdentifier,
        )
      ) {
        continue;
      }

      const sourceFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatObjectMetadataMaps,
        flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
      });

      if (!isDefined(sourceFlatObjectMetadata)) {
        this.logger.warn(
          `Missing source object for reverse relation field ${flatFieldMetadata.name} (${flatFieldMetadata.id}) in workspace ${workspaceId}, skipping`,
        );
        continue;
      }

      const derivedUniversalIdentifier =
        getSystemRelationFieldUniversalIdentifier({
          applicationUniversalIdentifier:
            sourceFlatObjectMetadata.applicationUniversalIdentifier,
          hostObjectUniversalIdentifier:
            hostFlatObjectMetadata.universalIdentifier,
          sourceObjectUniversalIdentifier:
            sourceFlatObjectMetadata.universalIdentifier,
        });

      const needsUniversalIdentifierUpdate =
        flatFieldMetadata.universalIdentifier !== derivedUniversalIdentifier;
      const needsFlagUpdate = !flatFieldMetadata.isSystemSideEffect;

      if (needsUniversalIdentifierUpdate) {
        universalIdentifierUpdates.push({
          id: flatFieldMetadata.id,
          universalIdentifier: derivedUniversalIdentifier,
        });
      } else if (needsFlagUpdate) {
        fieldMetadataIdsToFlagOnly.push(flatFieldMetadata.id);
      }
    }

    const totalToReconcile =
      universalIdentifierUpdates.length + fieldMetadataIdsToFlagOnly.length;

    if (totalToReconcile === 0) {
      this.logger.log(
        `No default-relation reverse field to reconcile for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Reconciling ${totalToReconcile} default-relation reverse field(s) for workspace ${workspaceId} (${universalIdentifierUpdates.length} re-owned identifier(s), ${fieldMetadataIdsToFlagOnly.length} flag-only)`,
    );

    if (isDryRun) {
      return;
    }

    for (const { id, universalIdentifier } of universalIdentifierUpdates) {
      await this.fieldMetadataRepository.update(
        { id, workspaceId },
        { universalIdentifier, isSystemSideEffect: true },
      );
    }

    if (fieldMetadataIdsToFlagOnly.length > 0) {
      await this.fieldMetadataRepository.update(
        { id: In(fieldMetadataIdsToFlagOnly), workspaceId },
        { isSystemSideEffect: true },
      );
    }

    await this.workspaceMigrationRunnerService.invalidateCache({
      allFlatEntityMapsKeys: [getMetadataFlatEntityMapsKey('fieldMetadata')],
      workspaceId,
    });

    this.logger.log(
      `Reconciled ${totalToReconcile} default-relation reverse field(s) for workspace ${workspaceId}`,
    );
  }
}
