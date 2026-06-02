import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { DEFAULT_RELATION_FIELD_APPEARANCE_BY_RELATION_OBJECT } from 'src/engine/metadata-modules/object-metadata/constants/default-relation-field-appearance.constant';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// Custom-object default relation field name -> relation object key in the appearance constant.
// (the field on the source object is named after the target join object's namePlural)
const RELATION_OBJECT_BY_DEFAULT_RELATION_FIELD_NAME = {
  noteTargets: 'noteTarget',
  taskTargets: 'taskTarget',
  attachments: 'attachment',
  timelineActivities: 'timelineActivity',
} as const;

const TYPO_TIMELINE_ICON = 'IconIconTimelineEvent';

@RegisteredWorkspaceCommand('2.9.0', 1799000040000)
@Command({
  name: 'upgrade:2-9:fix-default-relation-field-labels-icons',
  description:
    'Heal default relation field labels/icons in existing workspaces: custom objects showed the raw join-object values (e.g. "Note Targets" / IconBuildingSkyscraper), and the standard Company timelineActivities icon had a typo (IconIconTimelineEvent).',
})
export class FixDefaultRelationFieldLabelsIconsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const now = new Date().toISOString();
    const customFieldsToUpdate = [];
    const standardFieldsToUpdate = [];

    for (const flatField of Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(flatField) ||
        (flatField.type !== FieldMetadataType.RELATION &&
          flatField.type !== FieldMetadataType.MORPH_RELATION)
      ) {
        continue;
      }

      const objectUniversalIdentifier =
        flatObjectMetadataMaps.universalIdentifierById[
          flatField.objectMetadataId
        ];

      const flatObject = isDefined(objectUniversalIdentifier)
        ? flatObjectMetadataMaps.byUniversalIdentifier[
            objectUniversalIdentifier
          ]
        : undefined;

      if (!isDefined(flatObject)) {
        continue;
      }

      if (flatObject.isCustom) {
        const relationObject =
          RELATION_OBJECT_BY_DEFAULT_RELATION_FIELD_NAME[
            flatField.name as keyof typeof RELATION_OBJECT_BY_DEFAULT_RELATION_FIELD_NAME
          ];

        if (!isDefined(relationObject)) {
          continue;
        }

        const appearance =
          DEFAULT_RELATION_FIELD_APPEARANCE_BY_RELATION_OBJECT[relationObject];
        const label = i18nLabel(appearance.label);

        if (flatField.label === label && flatField.icon === appearance.icon) {
          continue;
        }

        customFieldsToUpdate.push({
          ...flatField,
          label,
          icon: appearance.icon,
          updatedAt: now,
        });
      } else if (
        flatField.name === 'timelineActivities' &&
        flatField.icon === TYPO_TIMELINE_ICON
      ) {
        standardFieldsToUpdate.push({
          ...flatField,
          icon: DEFAULT_RELATION_FIELD_APPEARANCE_BY_RELATION_OBJECT
            .timelineActivity.icon,
          updatedAt: now,
        });
      }
    }

    const totalToUpdate =
      customFieldsToUpdate.length + standardFieldsToUpdate.length;

    if (totalToUpdate === 0) {
      this.logger.log(
        `Default relation field labels/icons already up to date for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${customFieldsToUpdate.length} custom + ${standardFieldsToUpdate.length} standard relation field(s) to heal`,
    );

    if (isDryRun) {
      return;
    }

    const updateBatches = [
      {
        flatEntityToUpdate: customFieldsToUpdate,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
      },
      {
        flatEntityToUpdate: standardFieldsToUpdate,
        applicationUniversalIdentifier:
          twentyStandardFlatApplication.universalIdentifier,
      },
    ];

    for (const {
      flatEntityToUpdate,
      applicationUniversalIdentifier,
    } of updateBatches) {
      if (flatEntityToUpdate.length === 0) {
        continue;
      }

      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            allFlatEntityOperationByMetadataName: {
              fieldMetadata: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate,
              },
            },
            workspaceId,
            applicationUniversalIdentifier,
          },
        );

      if (result.status === 'fail') {
        this.logger.error(
          `Failed to heal relation field labels/icons for workspace ${workspaceId}`,
        );

        throw new Error(
          `Migration failed for workspace ${workspaceId} while healing default relation field labels/icons`,
        );
      }
    }

    this.logger.log(
      `Healed ${totalToUpdate} relation field(s) for workspace ${workspaceId}`,
    );
  }
}
