import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v5 } from 'uuid';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { getMetadataSerializedRelationNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-serialized-relation-names.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Field names auto-provisioned on every object; their universal identifiers
// are now deterministically derived from (application UID, object UID, name).
const SYSTEM_FIELD_NAMES = new Set([
  'id',
  'name',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'position',
  'searchVector',
]);

const DEFAULT_RELATION_FORWARD_FIELD_NAMES = new Set([
  'timelineActivities',
  'attachments',
  'noteTargets',
  'taskTargets',
]);

const DEFAULT_RELATION_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS = new Set<string>([
  STANDARD_OBJECTS.timelineActivity.universalIdentifier,
  STANDARD_OBJECTS.attachment.universalIdentifier,
  STANDARD_OBJECTS.noteTarget.universalIdentifier,
  STANDARD_OBJECTS.taskTarget.universalIdentifier,
]);

// Namespace the SDK used before default field universal identifiers were
// aligned with getFieldUniversalIdentifier; only rows still carrying a
// legacy-derived value are backfilled for installed applications, so
// author-provided identifiers are left untouched.
const LEGACY_SDK_UNIVERSAL_IDENTIFIER_NAMESPACE =
  '142046f0-4d80-48b5-ad56-26ad410e895c';

const computeLegacySdkDefaultFieldUniversalIdentifier = ({
  objectUniversalIdentifier,
  fieldName,
}: {
  objectUniversalIdentifier: string;
  fieldName: string;
}) =>
  v5(
    `${objectUniversalIdentifier}-${fieldName}`,
    LEGACY_SDK_UNIVERSAL_IDENTIFIER_NAMESPACE,
  );

const isMorphOrRelationFieldMetadataType = (type: FieldMetadataType) =>
  type === FieldMetadataType.RELATION ||
  type === FieldMetadataType.MORPH_RELATION;

@RegisteredWorkspaceCommand('2.19.0', 1783100000000)
@Command({
  name: 'upgrade:2-19:backfill-deterministic-field-universal-identifiers',
  description:
    'Recompute the universal identifier of auto-provisioned field metadata (system fields and default relation fields) to the deterministic getFieldUniversalIdentifier derivation.',
})
export class BackfillDeterministicFieldUniversalIdentifiersCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
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

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

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

    const updates: { id: string; newUniversalIdentifier: string }[] = [];

    for (const flatFieldMetadata of Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatFieldMetadata)) {
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

      const shouldBackfill = this.shouldBackfillFieldMetadata({
        flatFieldMetadata,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
        workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      });

      if (!shouldBackfill) {
        continue;
      }

      const newUniversalIdentifier = getFieldUniversalIdentifier({
        applicationUniversalIdentifier,
        objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
        name: flatFieldMetadata.name,
      });

      if (newUniversalIdentifier === flatFieldMetadata.universalIdentifier) {
        continue;
      }

      updates.push({ id: flatFieldMetadata.id, newUniversalIdentifier });
    }

    if (updates.length === 0) {
      this.logger.log(
        `No field universal identifiers to backfill for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Backfilling ${updates.length} field universal identifier(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    for (const { id, newUniversalIdentifier } of updates) {
      await this.fieldMetadataRepository.update(
        { id, workspaceId },
        { universalIdentifier: newUniversalIdentifier },
      );
    }

    const fieldMetadataRelatedNames = [
      'fieldMetadata',
      ...getMetadataRelatedMetadataNames('fieldMetadata'),
      ...getMetadataSerializedRelationNames('fieldMetadata'),
    ] as const;
    const cacheKeysToFlush = [
      ...new Set(fieldMetadataRelatedNames.map(getMetadataFlatEntityMapsKey)),
    ];

    await this.workspaceCacheService.flush(workspaceId, cacheKeysToFlush);

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );

    this.logger.log(
      `Backfilled ${updates.length} field universal identifier(s) for workspace ${workspaceId}`,
    );
  }

  private shouldBackfillFieldMetadata({
    flatFieldMetadata,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    twentyStandardApplicationId,
    workspaceCustomApplicationId,
  }: {
    flatFieldMetadata: FlatFieldMetadata;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    twentyStandardApplicationId: string;
    workspaceCustomApplicationId: string;
  }): boolean {
    // Standard application: only system fields are derived in
    // STANDARD_OBJECTS; every other standard field keeps its hardcoded value.
    if (flatFieldMetadata.applicationId === twentyStandardApplicationId) {
      return SYSTEM_FIELD_NAMES.has(flatFieldMetadata.name);
    }

    const relationTargetFlatObjectMetadata = isDefined(
      flatFieldMetadata.relationTargetObjectMetadataId,
    )
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityMaps: flatObjectMetadataMaps,
          flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
        })
      : undefined;

    if (flatFieldMetadata.applicationId === workspaceCustomApplicationId) {
      if (SYSTEM_FIELD_NAMES.has(flatFieldMetadata.name)) {
        return true;
      }

      if (!isMorphOrRelationFieldMetadataType(flatFieldMetadata.type)) {
        return false;
      }

      // Forward default relation fields on custom objects (attachments,
      // noteTargets, taskTargets, timelineActivities).
      if (
        DEFAULT_RELATION_FORWARD_FIELD_NAMES.has(flatFieldMetadata.name) &&
        isDefined(relationTargetFlatObjectMetadata) &&
        DEFAULT_RELATION_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.has(
          relationTargetFlatObjectMetadata.universalIdentifier,
        )
      ) {
        return true;
      }

      // Reverse default relation fields living on the standard relation
      // objects and pointing back at the custom object.
      if (
        DEFAULT_RELATION_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.has(
          flatObjectMetadata.universalIdentifier,
        ) &&
        isDefined(relationTargetFlatObjectMetadata) &&
        (flatFieldMetadata.name ===
          `target${capitalize(relationTargetFlatObjectMetadata.nameSingular)}` ||
          flatFieldMetadata.name ===
            relationTargetFlatObjectMetadata.nameSingular)
      ) {
        return true;
      }

      return false;
    }

    // Installed applications: only rows still carrying an SDK-auto-generated
    // (legacy derivation) identifier are backfilled; author-provided
    // identifiers must keep matching the application source code.
    const legacyDefaultUniversalIdentifier =
      computeLegacySdkDefaultFieldUniversalIdentifier({
        objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
        fieldName: flatFieldMetadata.name,
      });

    if (
      flatFieldMetadata.universalIdentifier === legacyDefaultUniversalIdentifier
    ) {
      return true;
    }

    // Legacy reverse default relation fields were derived from the custom
    // object universal identifier and the forward field name suffixed with
    // "Inverse".
    const relationTargetFlatFieldMetadata = isDefined(
      flatFieldMetadata.relationTargetFieldMetadataId,
    )
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityMaps: flatFieldMetadataMaps,
          flatEntityId: flatFieldMetadata.relationTargetFieldMetadataId,
        })
      : undefined;

    if (
      isDefined(relationTargetFlatObjectMetadata) &&
      isDefined(relationTargetFlatFieldMetadata)
    ) {
      const legacyReverseUniversalIdentifier =
        computeLegacySdkDefaultFieldUniversalIdentifier({
          objectUniversalIdentifier:
            relationTargetFlatObjectMetadata.universalIdentifier,
          fieldName: `${relationTargetFlatFieldMetadata.name}Inverse`,
        });

      if (
        flatFieldMetadata.universalIdentifier ===
        legacyReverseUniversalIdentifier
      ) {
        return true;
      }
    }

    return false;
  }
}
