import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { MigrationCommandOptions } from 'src/database/commands/command-runners/migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { SEARCH_FIELDS_FOR_COMPANY } from 'src/modules/company/standard-objects/company.workspace-entity';
import { SEARCH_FIELDS_FOR_DASHBOARD } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';
import { SEARCH_FIELDS_FOR_NOTES } from 'src/modules/note/standard-objects/note.workspace-entity';
import { SEARCH_FIELDS_FOR_OPPORTUNITY } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { SEARCH_FIELDS_FOR_PERSON } from 'src/modules/person/standard-objects/person.workspace-entity';
import { SEARCH_FIELDS_FOR_TASKS } from 'src/modules/task/standard-objects/task.workspace-entity';
import { SEARCH_FIELDS_FOR_WORKFLOW_RUNS } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { SEARCH_FIELDS_FOR_WORKFLOW_VERSIONS } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { SEARCH_FIELDS_FOR_WORKFLOWS } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { SEARCH_FIELDS_FOR_WORKSPACE_MEMBER } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const STANDARD_OBJECT_SEARCH_FIELDS_MAP: Partial<
  Record<string, FieldTypeAndNameMetadata[]>
> = {
  [STANDARD_OBJECT_IDS.person]: SEARCH_FIELDS_FOR_PERSON,
  [STANDARD_OBJECT_IDS.company]: SEARCH_FIELDS_FOR_COMPANY,
  [STANDARD_OBJECT_IDS.opportunity]: SEARCH_FIELDS_FOR_OPPORTUNITY,
  [STANDARD_OBJECT_IDS.task]: SEARCH_FIELDS_FOR_TASKS,
  [STANDARD_OBJECT_IDS.note]: SEARCH_FIELDS_FOR_NOTES,
  [STANDARD_OBJECT_IDS.dashboard]: SEARCH_FIELDS_FOR_DASHBOARD,
  [STANDARD_OBJECT_IDS.workspaceMember]: SEARCH_FIELDS_FOR_WORKSPACE_MEMBER,
  [STANDARD_OBJECT_IDS.workflow]: SEARCH_FIELDS_FOR_WORKFLOWS,
  [STANDARD_OBJECT_IDS.workflowVersion]: SEARCH_FIELDS_FOR_WORKFLOW_VERSIONS,
  [STANDARD_OBJECT_IDS.workflowRun]: SEARCH_FIELDS_FOR_WORKFLOW_RUNS,
};

@Command({
  name: 'upgrade:1-14:backfill-search-field-metadata',
  description:
    'Backfill searchFieldMetadata table with existing hardcoded SEARCH_FIELDS_FOR_* configurations',
})
export class BackfillSearchFieldMetadataCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(SearchFieldMetadataEntity)
    private readonly searchFieldMetadataRepository: Repository<SearchFieldMetadataEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Starting backfill of searchFieldMetadata for workspace ${workspaceId}...`,
    );

    const searchableObjects = await this.objectMetadataRepository.find({
      where: {
        workspaceId,
        isSearchable: true,
      },
      relations: ['fields'],
    });

    if (searchableObjects.length === 0) {
      this.logger.log(
        `No searchable objects found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    let backfilledCount = 0;
    let skippedCount = 0;

    for (const objectMetadata of searchableObjects) {
      try {
        const result = await this.backfillSearchFieldsForObject(
          objectMetadata,
          workspaceId,
          options,
        );

        if (result === 'backfilled') {
          backfilledCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        this.logger.error(
          `Failed to backfill search fields for ${objectMetadata.nameSingular} in workspace ${workspaceId}`,
          error,
        );
        skippedCount++;
      }
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] Would have ' : ''}Backfilled ${backfilledCount} objects, skipped ${skippedCount} out of ${searchableObjects.length} total`,
    );
  }

  private async backfillSearchFieldsForObject(
    objectMetadata: ObjectMetadataEntity,
    workspaceId: string,
    options: MigrationCommandOptions,
  ): Promise<'backfilled' | 'skipped'> {
    if (!objectMetadata.standardId) {
      this.logger.log(
        `Skipping ${objectMetadata.nameSingular} - not a standard object`,
      );

      return 'skipped';
    }

    const searchFields =
      STANDARD_OBJECT_SEARCH_FIELDS_MAP[objectMetadata.standardId];

    if (!searchFields || searchFields.length === 0) {
      this.logger.log(
        `Skipping ${objectMetadata.nameSingular} - no hardcoded search fields found`,
      );

      return 'skipped';
    }

    const fieldNames = searchFields.map((field) => field.name);
    const matchingFields = objectMetadata.fields.filter((field) =>
      fieldNames.includes(field.name),
    );

    if (matchingFields.length === 0) {
      this.logger.log(
        `Skipping ${objectMetadata.nameSingular} - no matching fields found`,
      );

      return 'skipped';
    }

    const existingSearchFieldMetadata =
      await this.searchFieldMetadataRepository.find({
        where: {
          objectMetadataId: objectMetadata.id,
          workspaceId,
        },
      });

    if (existingSearchFieldMetadata.length > 0) {
      this.logger.log(
        `Skipping ${objectMetadata.nameSingular} - searchFieldMetadata already exists`,
      );

      return 'skipped';
    }

    const searchFieldMetadataToInsert = matchingFields.map((field) => ({
      objectMetadataId: objectMetadata.id,
      fieldMetadataId: field.id,
      workspaceId,
    }));

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would insert ${searchFieldMetadataToInsert.length} searchFieldMetadata entries for ${objectMetadata.nameSingular}`,
      );
    } else {
      await this.searchFieldMetadataRepository.insert(
        searchFieldMetadataToInsert,
      );
      this.logger.log(
        `Backfilled ${searchFieldMetadataToInsert.length} search fields for ${objectMetadata.nameSingular}`,
      );
    }

    return 'backfilled';
  }
}
