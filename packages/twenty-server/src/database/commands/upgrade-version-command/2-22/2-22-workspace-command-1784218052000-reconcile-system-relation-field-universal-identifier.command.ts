import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import {
  getSystemRelationFieldUniversalIdentifier,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import {
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
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

// Every provisioning path of the default relations (legacy SDK manifest, legacy
// API transpiler, twenty-standard) stamps the reverse morph field with the
// engine-defined targetMorphId of its host standard object, while user-created
// morph relations carry freshly generated morphIds. Matching on this morphId
// (in addition to the name prefix) makes the reconciliation an exact
// fingerprint and cannot hijack a user-authored `target*` morph field hosted
// on one of the four standard relation objects.
const TARGET_MORPH_ID_BY_DEFAULT_RELATION_OBJECT_UNIVERSAL_IDENTIFIER: Record<
  string,
  string
> = Object.fromEntries(
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.map((standardObjectNameSingular) => [
    STANDARD_OBJECTS[standardObjectNameSingular].universalIdentifier,
    STANDARD_OBJECTS[standardObjectNameSingular].morphIds.targetMorphId.morphId,
  ]),
);

type SystemRelationFieldUpdate = {
  id: string;
  update: Partial<
    Pick<
      FieldMetadataEntity,
      'universalIdentifier' | 'isSystemSideEffect' | 'label' | 'icon'
    >
  >;
};

@RegisteredWorkspaceCommand('2.22.0', 1784218052000)
@Command({
  name: 'upgrade:2-22:reconcile-system-relation-field-universal-identifier',
  description:
    'Reconcile the default relations (timelineActivity/attachment/noteTarget/taskTarget) with the engine convention. Reverse morph fields get a name-free deterministic universal identifier, isSystemSideEffect: true, and name-derived label/icon, so an object rename becomes a lossless update and standard fields match custom ones. Forward fields of engine-provisioned relations (non twenty-standard source objects) are flagged isSystemSideEffect: true so both sides of a side-effect relation share the same engine ownership.',
})
export class ReconcileSystemRelationFieldUniversalIdentifierCommand extends ProvisionedWorkspaceCommandRunner {
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

    const systemRelationFieldUpdates: SystemRelationFieldUpdate[] = [];

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

      if (!isDefined(hostFlatObjectMetadata)) {
        continue;
      }

      const expectedTargetMorphId =
        TARGET_MORPH_ID_BY_DEFAULT_RELATION_OBJECT_UNIVERSAL_IDENTIFIER[
          hostFlatObjectMetadata.universalIdentifier
        ];

      if (
        !isDefined(expectedTargetMorphId) ||
        flatFieldMetadata.morphId !== expectedTargetMorphId
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

      const update: SystemRelationFieldUpdate['update'] = {};

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
        systemRelationFieldUpdates.push({ id: flatFieldMetadata.id, update });
      }

      // Both sides of an engine-provisioned relation are engine-owned. The
      // forward field on the source object was provisioned alongside the
      // reverse field, so it must carry isSystemSideEffect too — matching what
      // the create side-effect handler emits for objects created post-2.22.
      // twenty-standard source objects are excluded: their forward fields
      // (e.g. person.attachments) are authored by the standard application
      // with isSystemSideEffect: false, and flagging them here would diverge
      // from the standard builders.
      const isStandardAuthoredRelation =
        sourceFlatObjectMetadata.applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER;

      if (isStandardAuthoredRelation) {
        continue;
      }

      const forwardFlatFieldMetadata = isDefined(
        flatFieldMetadata.relationTargetFieldMetadataId,
      )
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityMaps: flatFieldMetadataMaps,
            flatEntityId: flatFieldMetadata.relationTargetFieldMetadataId,
          })
        : undefined;

      if (!isDefined(forwardFlatFieldMetadata)) {
        this.logger.warn(
          `Missing forward field for reverse relation field ${flatFieldMetadata.name} (${flatFieldMetadata.id}) in workspace ${workspaceId}, skipping`,
        );
        continue;
      }

      if (!forwardFlatFieldMetadata.isSystemSideEffect) {
        systemRelationFieldUpdates.push({
          id: forwardFlatFieldMetadata.id,
          update: { isSystemSideEffect: true },
        });
      }
    }

    if (systemRelationFieldUpdates.length === 0) {
      this.logger.log(
        `No default-relation field to reconcile for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Reconciling ${systemRelationFieldUpdates.length} default-relation field(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    for (const { id, update } of systemRelationFieldUpdates) {
      await this.fieldMetadataRepository.update({ id, workspaceId }, update);
    }

    await this.workspaceMigrationRunnerService.invalidateCache({
      allFlatEntityMapsKeys: [getMetadataFlatEntityMapsKey('fieldMetadata')],
      workspaceId,
    });

    this.logger.log(
      `Reconciled ${systemRelationFieldUpdates.length} default-relation field(s) for workspace ${workspaceId}`,
    );
  }
}
