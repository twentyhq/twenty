import { Command } from 'nest-commander';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { hasTimelineActivityObjectMetadata } from 'src/database/commands/upgrade-version-command/2-34/utils/has-timeline-activity-object-metadata.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';
import { isFieldMetadataSettingsOfType } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-64aa-4b6f-b003-9c74b97cee20';
const ATTACHMENT_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-bd3d-4c60-8dca-571c71d4447a';
const ATTACHMENT_TARGET_RELATION_FIELD_UNIVERSAL_IDENTIFIER =
  '721ddb1f-468d-535a-9809-cb3429a52e06';
const ATTACHMENT_TARGET_MORPH_ID = '20202020-f634-435d-ab8d-e1168b375c69';

const ATTACHMENT_TIMELINE_ACTIVITY_TYPES = [
  {
    universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c11',
    name: 'attachmentLinked',
    label: 'attached a file',
    action: 'linked',
    icon: 'IconPaperclip',
  },
  {
    universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c12',
    name: 'attachmentUnlinked',
    label: 'removed an attachment',
    action: 'unlinked',
    icon: 'IconUnlink',
  },
] as const;

@RegisteredWorkspaceCommand('2.35.0', 1787561579075)
@Command({
  name: 'upgrade:2-35:repair-attachment-timeline-activity-types',
  description:
    'Repair attachment timeline activity types in workspaces whose attachment target morph only contains custom fields',
})
export class RepairAttachmentTimelineActivityTypesCommand extends ProvisionedWorkspaceCommandRunner {
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
    const {
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      flatTimelineActivityTypeMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatFieldMetadataMaps',
      'flatObjectMetadataMaps',
      'flatTimelineActivityTypeMaps',
    ]);

    if (!hasTimelineActivityObjectMetadata(flatObjectMetadataMaps)) {
      return;
    }

    const missingDefinitions = ATTACHMENT_TIMELINE_ACTIVITY_TYPES.filter(
      ({ universalIdentifier }) =>
        !isDefined(
          flatTimelineActivityTypeMaps.byUniversalIdentifier[
            universalIdentifier
          ],
        ),
    );

    if (missingDefinitions.length === 0) {
      return;
    }

    const attachmentObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        ATTACHMENT_OBJECT_UNIVERSAL_IDENTIFIER
      ];
    const attachmentTargetRelationFieldMetadata = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((fieldMetadata) =>
        this.isValidAttachmentTargetMorphRelation({
          attachmentObjectMetadataId: attachmentObjectMetadata?.id,
          fieldMetadata,
        }),
      )
      .sort((firstFieldMetadata, secondFieldMetadata) => {
        const firstIsPreferred =
          firstFieldMetadata.universalIdentifier ===
          ATTACHMENT_TARGET_RELATION_FIELD_UNIVERSAL_IDENTIFIER;
        const secondIsPreferred =
          secondFieldMetadata.universalIdentifier ===
          ATTACHMENT_TARGET_RELATION_FIELD_UNIVERSAL_IDENTIFIER;

        if (firstIsPreferred !== secondIsPreferred) {
          return firstIsPreferred ? -1 : 1;
        }

        return firstFieldMetadata.universalIdentifier.localeCompare(
          secondFieldMetadata.universalIdentifier,
        );
      })[0];

    if (!isDefined(attachmentTargetRelationFieldMetadata)) {
      this.logger.warn(
        `No valid attachment target morph relation for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would add ${missingDefinitions.length} attachment timeline activity types for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const now = new Date().toISOString();
    const flatTimelineActivityTypesToCreate: FlatTimelineActivityType[] =
      missingDefinitions.map((definition) => ({
        id: v4(),
        workspaceId,
        applicationId: twentyStandardFlatApplication.id,
        applicationUniversalIdentifier:
          STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        universalIdentifier: definition.universalIdentifier,
        name: definition.name,
        label: definition.label,
        action: definition.action,
        icon: definition.icon,
        frontComponentUniversalIdentifier: null,
        objectUniversalIdentifier: ATTACHMENT_OBJECT_UNIVERSAL_IDENTIFIER,
        targetRelationFieldUniversalIdentifier:
          attachmentTargetRelationFieldMetadata.universalIdentifier,
        triggerFieldUniversalIdentifiers: null,
        replacesTimelineActivityTypeUniversalIdentifier: null,
        isActive: true,
        overrides: null,
        createdAt: now,
        updatedAt: now,
      }));

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            timelineActivityType: {
              flatEntityToCreate: flatTimelineActivityTypesToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to repair attachment timeline activity types for workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
      );
    }
  }

  private isValidAttachmentTargetMorphRelation({
    attachmentObjectMetadataId,
    fieldMetadata,
  }: {
    attachmentObjectMetadataId: string | undefined;
    fieldMetadata: FlatFieldMetadata;
  }): boolean {
    return (
      isDefined(attachmentObjectMetadataId) &&
      fieldMetadata.objectMetadataId === attachmentObjectMetadataId &&
      fieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
      fieldMetadata.morphId === ATTACHMENT_TARGET_MORPH_ID &&
      isFieldMetadataSettingsOfType(
        fieldMetadata.settings,
        FieldMetadataType.MORPH_RELATION,
      ) &&
      fieldMetadata.settings.relationType === RelationType.MANY_TO_ONE &&
      isDefined(fieldMetadata.relationTargetObjectMetadataId) &&
      isDefined(fieldMetadata.relationTargetFieldMetadataId)
    );
  }
}
