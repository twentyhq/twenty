import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

// Fields that should be marked as isSystem: true
const FIELDS_TO_MARK_AS_SYSTEM = [
  // attachment: deprecated fields
  STANDARD_OBJECTS.attachment.fields.fullPath.universalIdentifier,
  STANDARD_OBJECTS.attachment.fields.fileCategory.universalIdentifier,
  // timelineActivity: linked record fields
  STANDARD_OBJECTS.timelineActivity.fields.linkedRecordCachedName
    .universalIdentifier,
  STANDARD_OBJECTS.timelineActivity.fields.linkedRecordId.universalIdentifier,
  STANDARD_OBJECTS.timelineActivity.fields.linkedObjectMetadataId
    .universalIdentifier,
  // workspaceMember: relational fields
  STANDARD_OBJECTS.workspaceMember.fields.favorites.universalIdentifier,
  STANDARD_OBJECTS.workspaceMember.fields.accountOwnerForCompanies
    .universalIdentifier,
  STANDARD_OBJECTS.workspaceMember.fields.connectedAccounts.universalIdentifier,
  STANDARD_OBJECTS.workspaceMember.fields.messageParticipants
    .universalIdentifier,
  STANDARD_OBJECTS.workspaceMember.fields.blocklist.universalIdentifier,
  STANDARD_OBJECTS.workspaceMember.fields.calendarEventParticipants
    .universalIdentifier,
];

// Morph target fields that should have label "Target" and icon "IconArrowUpRight"
const MORPH_FIELDS_TO_RELABEL = [
  // attachment
  STANDARD_OBJECTS.attachment.fields.targetTask.universalIdentifier,
  STANDARD_OBJECTS.attachment.fields.targetNote.universalIdentifier,
  STANDARD_OBJECTS.attachment.fields.targetPerson.universalIdentifier,
  STANDARD_OBJECTS.attachment.fields.targetCompany.universalIdentifier,
  STANDARD_OBJECTS.attachment.fields.targetOpportunity.universalIdentifier,
  STANDARD_OBJECTS.attachment.fields.targetDashboard.universalIdentifier,
  STANDARD_OBJECTS.attachment.fields.targetWorkflow.universalIdentifier,
  // noteTarget
  STANDARD_OBJECTS.noteTarget.fields.targetPerson.universalIdentifier,
  STANDARD_OBJECTS.noteTarget.fields.targetCompany.universalIdentifier,
  STANDARD_OBJECTS.noteTarget.fields.targetOpportunity.universalIdentifier,
  // taskTarget
  STANDARD_OBJECTS.taskTarget.fields.targetPerson.universalIdentifier,
  STANDARD_OBJECTS.taskTarget.fields.targetCompany.universalIdentifier,
  STANDARD_OBJECTS.taskTarget.fields.targetOpportunity.universalIdentifier,
  // timelineActivity
  STANDARD_OBJECTS.timelineActivity.fields.targetPerson.universalIdentifier,
  STANDARD_OBJECTS.timelineActivity.fields.targetCompany.universalIdentifier,
  STANDARD_OBJECTS.timelineActivity.fields.targetOpportunity
    .universalIdentifier,
  STANDARD_OBJECTS.timelineActivity.fields.targetTask.universalIdentifier,
  STANDARD_OBJECTS.timelineActivity.fields.targetNote.universalIdentifier,
  STANDARD_OBJECTS.timelineActivity.fields.targetWorkflow.universalIdentifier,
  STANDARD_OBJECTS.timelineActivity.fields.targetWorkflowVersion
    .universalIdentifier,
  STANDARD_OBJECTS.timelineActivity.fields.targetWorkflowRun
    .universalIdentifier,
  STANDARD_OBJECTS.timelineActivity.fields.targetDashboard.universalIdentifier,
];

interface ViewFieldDef {
  fieldUI: string;
  viewFieldUI: string;
  position: number;
}

interface ViewToBackfill {
  objectUI: string;
  viewName: string;
  viewIcon: string;
  viewUI: string;
  viewFields: ViewFieldDef[];
}

const VIEWS_TO_BACKFILL: ViewToBackfill[] = [
  {
    objectUI: STANDARD_OBJECTS.attachment.universalIdentifier,
    viewName: 'All Attachments',
    viewIcon: 'IconList',
    viewUI:
      STANDARD_OBJECTS.attachment.views.allAttachments.universalIdentifier,
    viewFields: [
      {
        fieldUI: STANDARD_OBJECTS.attachment.fields.name.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.attachment.views.allAttachments.viewFields.name
            .universalIdentifier,
        position: 0,
      },
      {
        fieldUI: STANDARD_OBJECTS.attachment.fields.file.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.attachment.views.allAttachments.viewFields.file
            .universalIdentifier,
        position: 1,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.attachment.fields.targetPerson.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.attachment.views.allAttachments.viewFields
            .targetPerson.universalIdentifier,
        position: 2,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.attachment.fields.targetCompany.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.attachment.views.allAttachments.viewFields
            .targetCompany.universalIdentifier,
        position: 3,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.attachment.fields.targetOpportunity
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.attachment.views.allAttachments.viewFields
            .targetOpportunity.universalIdentifier,
        position: 4,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.attachment.fields.targetTask.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.attachment.views.allAttachments.viewFields.targetTask
            .universalIdentifier,
        position: 5,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.attachment.fields.targetNote.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.attachment.views.allAttachments.viewFields.targetNote
            .universalIdentifier,
        position: 6,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.attachment.fields.targetDashboard
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.attachment.views.allAttachments.viewFields
            .targetDashboard.universalIdentifier,
        position: 7,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.attachment.fields.targetWorkflow.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.attachment.views.allAttachments.viewFields
            .targetWorkflow.universalIdentifier,
        position: 8,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.attachment.fields.createdBy.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.attachment.views.allAttachments.viewFields.createdBy
            .universalIdentifier,
        position: 9,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.attachment.fields.createdAt.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.attachment.views.allAttachments.viewFields.createdAt
            .universalIdentifier,
        position: 10,
      },
    ],
  },
  {
    objectUI: STANDARD_OBJECTS.noteTarget.universalIdentifier,
    viewName: 'All Note Targets',
    viewIcon: 'IconList',
    viewUI:
      STANDARD_OBJECTS.noteTarget.views.allNoteTargets.universalIdentifier,
    viewFields: [
      {
        fieldUI: STANDARD_OBJECTS.noteTarget.fields.id.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.noteTarget.views.allNoteTargets.viewFields.id
            .universalIdentifier,
        position: 0,
      },
      {
        fieldUI: STANDARD_OBJECTS.noteTarget.fields.note.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.noteTarget.views.allNoteTargets.viewFields.note
            .universalIdentifier,
        position: 1,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.noteTarget.fields.targetPerson.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.noteTarget.views.allNoteTargets.viewFields
            .targetPerson.universalIdentifier,
        position: 2,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.noteTarget.fields.targetCompany.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.noteTarget.views.allNoteTargets.viewFields
            .targetCompany.universalIdentifier,
        position: 3,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.noteTarget.fields.targetOpportunity
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.noteTarget.views.allNoteTargets.viewFields
            .targetOpportunity.universalIdentifier,
        position: 4,
      },
    ],
  },
  {
    objectUI: STANDARD_OBJECTS.taskTarget.universalIdentifier,
    viewName: 'All Task Targets',
    viewIcon: 'IconList',
    viewUI:
      STANDARD_OBJECTS.taskTarget.views.allTaskTargets.universalIdentifier,
    viewFields: [
      {
        fieldUI: STANDARD_OBJECTS.taskTarget.fields.id.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.taskTarget.views.allTaskTargets.viewFields.id
            .universalIdentifier,
        position: 0,
      },
      {
        fieldUI: STANDARD_OBJECTS.taskTarget.fields.task.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.taskTarget.views.allTaskTargets.viewFields.task
            .universalIdentifier,
        position: 1,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.taskTarget.fields.targetPerson.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.taskTarget.views.allTaskTargets.viewFields
            .targetPerson.universalIdentifier,
        position: 2,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.taskTarget.fields.targetCompany.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.taskTarget.views.allTaskTargets.viewFields
            .targetCompany.universalIdentifier,
        position: 3,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.taskTarget.fields.targetOpportunity
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.taskTarget.views.allTaskTargets.viewFields
            .targetOpportunity.universalIdentifier,
        position: 4,
      },
    ],
  },
  {
    objectUI: STANDARD_OBJECTS.timelineActivity.universalIdentifier,
    viewName: 'All Timeline Activities',
    viewIcon: 'IconList',
    viewUI:
      STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
        .universalIdentifier,
    viewFields: [
      {
        fieldUI:
          STANDARD_OBJECTS.timelineActivity.fields.name.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
            .viewFields.name.universalIdentifier,
        position: 0,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.timelineActivity.fields.happensAt
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
            .viewFields.happensAt.universalIdentifier,
        position: 1,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.timelineActivity.fields.targetPerson
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
            .viewFields.targetPerson.universalIdentifier,
        position: 2,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.timelineActivity.fields.targetCompany
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
            .viewFields.targetCompany.universalIdentifier,
        position: 3,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.timelineActivity.fields.targetOpportunity
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
            .viewFields.targetOpportunity.universalIdentifier,
        position: 4,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.timelineActivity.fields.targetTask
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
            .viewFields.targetTask.universalIdentifier,
        position: 5,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.timelineActivity.fields.targetNote
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
            .viewFields.targetNote.universalIdentifier,
        position: 6,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.timelineActivity.fields.targetWorkflow
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
            .viewFields.targetWorkflow.universalIdentifier,
        position: 7,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.timelineActivity.fields.targetWorkflowVersion
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
            .viewFields.targetWorkflowVersion.universalIdentifier,
        position: 8,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.timelineActivity.fields.targetWorkflowRun
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
            .viewFields.targetWorkflowRun.universalIdentifier,
        position: 9,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.timelineActivity.fields.targetDashboard
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
            .viewFields.targetDashboard.universalIdentifier,
        position: 10,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.timelineActivity.fields.workspaceMember
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
            .viewFields.workspaceMember.universalIdentifier,
        position: 11,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.timelineActivity.fields.properties
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
            .viewFields.properties.universalIdentifier,
        position: 12,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.timelineActivity.fields.linkedRecordCachedName
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
            .viewFields.linkedRecordCachedName.universalIdentifier,
        position: 13,
      },
    ],
  },
  {
    objectUI: STANDARD_OBJECTS.workspaceMember.universalIdentifier,
    viewName: 'All Workspace Members',
    viewIcon: 'IconList',
    viewUI:
      STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers
        .universalIdentifier,
    viewFields: [
      {
        fieldUI:
          STANDARD_OBJECTS.workspaceMember.fields.name.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .name.universalIdentifier,
        position: 0,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.workspaceMember.fields.userEmail.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .userEmail.universalIdentifier,
        position: 1,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.workspaceMember.fields.avatarUrl.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .avatarUrl.universalIdentifier,
        position: 2,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.workspaceMember.fields.colorScheme
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .colorScheme.universalIdentifier,
        position: 3,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.workspaceMember.fields.locale.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .locale.universalIdentifier,
        position: 4,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.workspaceMember.fields.timeZone.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .timeZone.universalIdentifier,
        position: 5,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.workspaceMember.fields.dateFormat
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .dateFormat.universalIdentifier,
        position: 6,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.workspaceMember.fields.timeFormat
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .timeFormat.universalIdentifier,
        position: 7,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.workspaceMember.fields.createdAt.universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .createdAt.universalIdentifier,
        position: 8,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.workspaceMember.fields.ownedOpportunities
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .ownedOpportunities.universalIdentifier,
        position: 9,
      },
      {
        fieldUI:
          STANDARD_OBJECTS.workspaceMember.fields.assignedTasks
            .universalIdentifier,
        viewFieldUI:
          STANDARD_OBJECTS.workspaceMember.views.allWorkspaceMembers.viewFields
            .assignedTasks.universalIdentifier,
        position: 10,
      },
    ],
  },
];

@Command({
  name: 'upgrade:1-18:backfill-standard-views-and-field-metadata',
  description:
    'Backfill standard views and fix field metadata (isSystem, labels, icons) for attachment, noteTarget, taskTarget, timelineActivity, workspaceMember',
})
export class BackfillStandardViewsAndFieldMetadataCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const dryRun = options?.dryRun ?? false;

    this.logger.log(
      `${dryRun ? '[DRY RUN] ' : ''}Backfilling views and field metadata for workspace ${workspaceId}`,
    );

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Would update isSystem, labels/icons, backfill views and viewFields for workspace ${workspaceId}. Skipping.`,
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Part 1: Mark fields as isSystem
      const systemResult = await queryRunner.query(
        `UPDATE core."fieldMetadata"
         SET "isSystem" = true
         WHERE "workspaceId" = $1
           AND "universalIdentifier" = ANY($2)
           AND "isSystem" = false`,
        [workspaceId, FIELDS_TO_MARK_AS_SYSTEM],
      );

      const systemCount = systemResult?.[1] ?? 0;

      if (systemCount > 0) {
        this.logger.log(
          `Marked ${systemCount} field(s) as isSystem for workspace ${workspaceId}`,
        );
      }

      // Part 1b: Update morph field labels and icons to "Target"
      const labelResult = await queryRunner.query(
        `UPDATE core."fieldMetadata"
         SET label = 'Target', icon = 'IconArrowUpRight'
         WHERE "workspaceId" = $1
           AND "universalIdentifier" = ANY($2)
           AND (label != 'Target' OR icon != 'IconArrowUpRight')`,
        [workspaceId, MORPH_FIELDS_TO_RELABEL],
      );

      const labelCount = labelResult?.[1] ?? 0;

      if (labelCount > 0) {
        this.logger.log(
          `Relabeled ${labelCount} morph field(s) to "Target" for workspace ${workspaceId}`,
        );
      }

      // Part 2: Resolve applicationId for twenty-standard app
      const applicationRows = await queryRunner.query(
        `SELECT id FROM core."application"
         WHERE "workspaceId" = $1
           AND "universalIdentifier" = $2`,
        [workspaceId, TWENTY_STANDARD_APPLICATION.universalIdentifier],
      );

      if (applicationRows.length === 0) {
        this.logger.warn(
          `Twenty Standard Application not found for workspace ${workspaceId}. Skipping view backfill.`,
        );
        await queryRunner.commitTransaction();
        await this.invalidateCaches(workspaceId);

        return;
      }

      const applicationId = applicationRows[0].id;

      // Part 3 & 4: Backfill views and viewFields
      for (const view of VIEWS_TO_BACKFILL) {
        // Insert view if it doesn't exist
        const viewInsertResult = await queryRunner.query(
          `INSERT INTO core."view" (
             id, name, "objectMetadataId", type, icon, position,
             visibility, "workspaceId", "applicationId", "universalIdentifier"
           )
           SELECT
             gen_random_uuid(), $2, om.id, 'TABLE', $3, 0,
             'WORKSPACE', $1, $4, $5
           FROM core."objectMetadata" om
           WHERE om."workspaceId" = $1
             AND om."universalIdentifier" = $6
             AND NOT EXISTS (
               SELECT 1 FROM core."view" v
               WHERE v."workspaceId" = $1
                 AND v."universalIdentifier" = $5
                 AND v."deletedAt" IS NULL
             )
           RETURNING 1`,
          [
            workspaceId,
            view.viewName,
            view.viewIcon,
            applicationId,
            view.viewUI,
            view.objectUI,
          ],
        );

        const viewInserted = viewInsertResult?.length ?? 0;

        if (viewInserted > 0) {
          this.logger.log(
            `Created view "${view.viewName}" for workspace ${workspaceId}`,
          );
        }

        // Insert viewFields
        for (const viewField of view.viewFields) {
          await queryRunner.query(
            `INSERT INTO core."viewField" (
               id, "fieldMetadataId", "isVisible", size, position,
               "viewId", "workspaceId", "applicationId", "universalIdentifier"
             )
             SELECT
               gen_random_uuid(), fm.id, true, 150, $4,
               v.id, $1, $5, $6
             FROM core."view" v
             JOIN core."fieldMetadata" fm
               ON fm."workspaceId" = $1
               AND fm."universalIdentifier" = $3
             WHERE v."workspaceId" = $1
               AND v."universalIdentifier" = $2
               AND v."deletedAt" IS NULL
               AND NOT EXISTS (
                 SELECT 1 FROM core."viewField" vf
                 WHERE vf."workspaceId" = $1
                   AND vf."universalIdentifier" = $6
                   AND vf."deletedAt" IS NULL
               )`,
            [
              workspaceId,
              view.viewUI,
              viewField.fieldUI,
              viewField.position,
              applicationId,
              viewField.viewFieldUI,
            ],
          );
        }
      }

      await queryRunner.commitTransaction();

      this.logger.log(`Completed for workspace ${workspaceId}`);

      await this.invalidateCaches(workspaceId);
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
        this.logger.error(
          `Error backfilling views and field metadata (rolled back) for workspace ${workspaceId}`,
          error,
        );
      } else {
        this.logger.error(
          `Error backfilling views and field metadata (after commit) for workspace ${workspaceId}`,
          error,
        );
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async invalidateCaches(workspaceId: string): Promise<void> {
    const modifiedMetadataNames = [
      'fieldMetadata',
      'view',
      'viewField',
    ] as const;

    const cacheKeysToInvalidate: WorkspaceCacheKeyName[] = [
      ...new Set(
        modifiedMetadataNames
          .flatMap((name) => [name, ...getMetadataRelatedMetadataNames(name)])
          .map(getMetadataFlatEntityMapsKey),
      ),
      'ORMEntityMetadatas',
    ];

    await this.workspaceCacheService.invalidateAndRecompute(
      workspaceId,
      cacheKeysToInvalidate,
    );

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );

    await this.workspaceCacheStorageService.flush(workspaceId);

    this.logger.log(
      `Cache invalidated and metadata version incremented for workspace ${workspaceId}`,
    );
  }
}
