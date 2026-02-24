import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { OLD_STANDARD_OBJECTS } from 'src/database/commands/upgrade-version-command/1-19/constants/old-standard-objects.constant';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { STANDARD_AGENT } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-agent.constant';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

const OLD_ROLE_ADMIN_UNIVERSAL_IDENTIFIER =
  '20202020-0001-0001-0001-000000000001';
const OLD_AGENT_HELPER_UNIVERSAL_IDENTIFIER =
  '20202020-0002-0001-0001-000000000004';

type StandardObjectEntry = {
  universalIdentifier: string;
  morphIds?: Record<string, { morphId: string }>;
  fields: Record<string, { universalIdentifier: string }>;
  indexes: Record<string, { universalIdentifier: string }>;
  views?: Record<
    string,
    {
      universalIdentifier: string;
      viewFields: Record<string, { universalIdentifier: string }>;
      viewFieldGroups?: Record<string, { universalIdentifier: string }>;
      viewFilters?: Record<string, { universalIdentifier: string }>;
      viewGroups?: Record<string, { universalIdentifier: string }>;
    }
  >;
};

type IdentifierMismatch = {
  table: string;
  column: string;
  oldValue: string;
  newValue: string;
};

const collectStandardObjectMismatches = (): IdentifierMismatch[] => {
  const mismatches: IdentifierMismatch[] = [];
  const oldObjects = OLD_STANDARD_OBJECTS as Record<
    string,
    StandardObjectEntry
  >;
  const newObjects = STANDARD_OBJECTS as Record<string, StandardObjectEntry>;

  for (const objectName of Object.keys(oldObjects)) {
    const oldObject = oldObjects[objectName];
    const newObject = newObjects[objectName];

    if (!newObject) continue;

    // Object-level universalIdentifier → core."objectMetadata"
    if (oldObject.universalIdentifier !== newObject.universalIdentifier) {
      mismatches.push({
        table: 'core."objectMetadata"',
        column: '"universalIdentifier"',
        oldValue: oldObject.universalIdentifier,
        newValue: newObject.universalIdentifier,
      });
    }

    // Field-level universalIdentifiers → core."fieldMetadata"
    for (const fieldName of Object.keys(oldObject.fields)) {
      const oldField = oldObject.fields[fieldName];
      const newField = newObject.fields[fieldName];

      if (
        !newField ||
        oldField.universalIdentifier === newField.universalIdentifier
      )
        continue;

      mismatches.push({
        table: 'core."fieldMetadata"',
        column: '"universalIdentifier"',
        oldValue: oldField.universalIdentifier,
        newValue: newField.universalIdentifier,
      });
    }

    // MorphId values → core."fieldMetadata"."morphId"
    if (oldObject.morphIds && newObject.morphIds) {
      for (const morphName of Object.keys(oldObject.morphIds)) {
        const oldMorph = oldObject.morphIds[morphName];
        const newMorph = newObject.morphIds[morphName];

        if (!newMorph || oldMorph.morphId === newMorph.morphId) continue;

        mismatches.push({
          table: 'core."fieldMetadata"',
          column: '"morphId"',
          oldValue: oldMorph.morphId,
          newValue: newMorph.morphId,
        });
      }
    }

    // Index-level universalIdentifiers → core."indexMetadata"
    for (const indexName of Object.keys(oldObject.indexes)) {
      const oldIndex = oldObject.indexes[indexName];
      const newIndex = newObject.indexes[indexName];

      if (
        !newIndex ||
        oldIndex.universalIdentifier === newIndex.universalIdentifier
      )
        continue;

      mismatches.push({
        table: 'core."indexMetadata"',
        column: '"universalIdentifier"',
        oldValue: oldIndex.universalIdentifier,
        newValue: newIndex.universalIdentifier,
      });
    }

    // View-level and nested view identifiers
    if (oldObject.views && newObject.views) {
      for (const viewName of Object.keys(oldObject.views)) {
        const oldView = oldObject.views[viewName];
        const newView = newObject.views[viewName];

        if (!newView) continue;

        // View universalIdentifier → core."view"
        if (oldView.universalIdentifier !== newView.universalIdentifier) {
          mismatches.push({
            table: 'core."view"',
            column: '"universalIdentifier"',
            oldValue: oldView.universalIdentifier,
            newValue: newView.universalIdentifier,
          });
        }

        // ViewField universalIdentifiers → core."viewField"
        for (const viewFieldName of Object.keys(oldView.viewFields)) {
          const oldViewField = oldView.viewFields[viewFieldName];
          const newViewField = newView.viewFields[viewFieldName];

          if (
            !newViewField ||
            oldViewField.universalIdentifier ===
              newViewField.universalIdentifier
          )
            continue;

          mismatches.push({
            table: 'core."viewField"',
            column: '"universalIdentifier"',
            oldValue: oldViewField.universalIdentifier,
            newValue: newViewField.universalIdentifier,
          });
        }

        // ViewFieldGroup universalIdentifiers → core."viewFieldGroup"
        if (oldView.viewFieldGroups && newView.viewFieldGroups) {
          for (const groupName of Object.keys(oldView.viewFieldGroups)) {
            const oldGroup = oldView.viewFieldGroups[groupName];
            const newGroup = newView.viewFieldGroups[groupName];

            if (
              !newGroup ||
              oldGroup.universalIdentifier === newGroup.universalIdentifier
            )
              continue;

            mismatches.push({
              table: 'core."viewFieldGroup"',
              column: '"universalIdentifier"',
              oldValue: oldGroup.universalIdentifier,
              newValue: newGroup.universalIdentifier,
            });
          }
        }

        // ViewFilter universalIdentifiers → core."viewFilter"
        if (oldView.viewFilters && newView.viewFilters) {
          for (const filterName of Object.keys(oldView.viewFilters)) {
            const oldFilter = oldView.viewFilters[filterName];
            const newFilter = newView.viewFilters[filterName];

            if (
              !newFilter ||
              oldFilter.universalIdentifier === newFilter.universalIdentifier
            )
              continue;

            mismatches.push({
              table: 'core."viewFilter"',
              column: '"universalIdentifier"',
              oldValue: oldFilter.universalIdentifier,
              newValue: newFilter.universalIdentifier,
            });
          }
        }

        // ViewGroup universalIdentifiers → core."viewGroup"
        if (oldView.viewGroups && newView.viewGroups) {
          for (const viewGroupName of Object.keys(oldView.viewGroups)) {
            const oldViewGroup = oldView.viewGroups[viewGroupName];
            const newViewGroup = newView.viewGroups[viewGroupName];

            if (
              !newViewGroup ||
              oldViewGroup.universalIdentifier ===
                newViewGroup.universalIdentifier
            )
              continue;

            mismatches.push({
              table: 'core."viewGroup"',
              column: '"universalIdentifier"',
              oldValue: oldViewGroup.universalIdentifier,
              newValue: newViewGroup.universalIdentifier,
            });
          }
        }
      }
    }
  }

  return mismatches;
};

const STANDARD_OBJECT_MISMATCHES = collectStandardObjectMismatches();

@Command({
  name: 'upgrade:1-19:fix-invalid-standard-universal-identifiers',
  description:
    'Fix invalid universalIdentifier values in core tables to comply with UUID v4 format',
})
export class FixInvalidStandardUniversalIdentifiersCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options?.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Fixing universal identifiers for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would fix role, agent, and ${STANDARD_OBJECT_MISMATCHES.length} standard object universal identifier mismatches in workspace ${workspaceId}. Skipping.`,
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      let totalUpdated = 0;

      const roleResult = await queryRunner.query(
        `UPDATE core."role"
         SET "universalIdentifier" = $1
         WHERE "workspaceId" = $2
           AND "universalIdentifier" = $3`,
        [
          STANDARD_ROLE.admin.universalIdentifier,
          workspaceId,
          OLD_ROLE_ADMIN_UNIVERSAL_IDENTIFIER,
        ],
      );

      const roleUpdatedCount = roleResult?.[1] ?? 0;

      if (roleUpdatedCount > 0) {
        this.logger.log(
          `Updated ${roleUpdatedCount} role universalIdentifier in workspace ${workspaceId}`,
        );
        totalUpdated += roleUpdatedCount;
      }

      const agentResult = await queryRunner.query(
        `UPDATE core."agent"
         SET "universalIdentifier" = $1
         WHERE "workspaceId" = $2
           AND "universalIdentifier" = $3`,
        [
          STANDARD_AGENT.helper.universalIdentifier,
          workspaceId,
          OLD_AGENT_HELPER_UNIVERSAL_IDENTIFIER,
        ],
      );

      const agentUpdatedCount = agentResult?.[1] ?? 0;

      if (agentUpdatedCount > 0) {
        this.logger.log(
          `Updated ${agentUpdatedCount} agent universalIdentifier in workspace ${workspaceId}`,
        );
        totalUpdated += agentUpdatedCount;
      }

      const updateCountsByTable: Record<string, number> = {};

      for (const mismatch of STANDARD_OBJECT_MISMATCHES) {
        const result = await queryRunner.query(
          `UPDATE ${mismatch.table}
           SET ${mismatch.column} = $1
           WHERE "workspaceId" = $2
             AND ${mismatch.column} = $3`,
          [mismatch.newValue, workspaceId, mismatch.oldValue],
        );

        const updatedCount = result?.[1] ?? 0;

        if (updatedCount > 0) {
          const tableKey = `${mismatch.table}.${mismatch.column}`;

          updateCountsByTable[tableKey] =
            (updateCountsByTable[tableKey] ?? 0) + updatedCount;
          totalUpdated += updatedCount;
        }
      }

      for (const [tableKey, count] of Object.entries(updateCountsByTable)) {
        this.logger.log(
          `Updated ${count} rows in ${tableKey} for workspace ${workspaceId}`,
        );
      }

      if (totalUpdated === 0) {
        this.logger.log(
          `No universal identifiers needed updating in workspace ${workspaceId}`,
        );
      } else {
        this.logger.log(
          `Updated ${totalUpdated} total universal identifiers in workspace ${workspaceId}`,
        );
      }
    } finally {
      await queryRunner.release();
    }
  }
}
