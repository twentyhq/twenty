import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { getSystemRelationFieldUniversalIdentifier } from 'twenty-shared/application';
import {
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-migration/constant/standard-object-icons';
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

type ReverseSystemRelationFieldUpdate = {
  id: string;
  update: Partial<
    Pick<
      FieldMetadataEntity,
      'universalIdentifier' | 'isSystemSideEffect' | 'label' | 'icon'
    >
  >;
};

@RegisteredWorkspaceCommand('2.21.0', 1783925900000)
@Command({
  name: 'upgrade:2-21:reconcile-system-relation-field-universal-identifier',
  description:
    'Reconcile the reverse morph fields of default relations (timelineActivity/attachment/noteTarget/taskTarget) with the engine convention: name-free deterministic universal identifier, isSystemSideEffect: true, and name-derived label/icon, so an object rename becomes a lossless update and standard fields match custom ones.',
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

    const reverseFieldUpdates: ReverseSystemRelationFieldUpdate[] = [];

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
      // Name-derived label + host-object icon, matching the engine provisioner
      // convention already used for custom objects.
      const derivedLabel = capitalize(sourceFlatObjectMetadata.nameSingular);
      const derivedIcon =
        STANDARD_OBJECT_ICONS[
          hostFlatObjectMetadata.nameSingular as keyof typeof STANDARD_OBJECT_ICONS
        ] ?? 'IconBuildingSkyscraper';

      const update: ReverseSystemRelationFieldUpdate['update'] = {};

      if (flatFieldMetadata.universalIdentifier !== derivedUniversalIdentifier) {
        update.universalIdentifier = derivedUniversalIdentifier;
      }
      if (!flatFieldMetadata.isSystemSideEffect) {
        update.isSystemSideEffect = true;
      }
      if (flatFieldMetadata.label !== derivedLabel) {
        update.label = derivedLabel;
      }
      if (flatFieldMetadata.icon !== derivedIcon) {
        update.icon = derivedIcon;
      }

      if (Object.keys(update).length > 0) {
        reverseFieldUpdates.push({ id: flatFieldMetadata.id, update });
      }
    }

    if (reverseFieldUpdates.length === 0) {
      this.logger.log(
        `No default-relation reverse field to reconcile for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Reconciling ${reverseFieldUpdates.length} default-relation reverse field(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    for (const { id, update } of reverseFieldUpdates) {
      await this.fieldMetadataRepository.update({ id, workspaceId }, update);
    }

    await this.workspaceMigrationRunnerService.invalidateCache({
      allFlatEntityMapsKeys: [getMetadataFlatEntityMapsKey('fieldMetadata')],
      workspaceId,
    });

    this.logger.log(
      `Reconciled ${reverseFieldUpdates.length} default-relation reverse field(s) for workspace ${workspaceId}`,
    );
  }
}
