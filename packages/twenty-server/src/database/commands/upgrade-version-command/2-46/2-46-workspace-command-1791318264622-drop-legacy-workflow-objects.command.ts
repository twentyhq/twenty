import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildCoreWorkflowCommandMenuItemUpdates } from 'src/database/commands/upgrade-version-command/2-46/utils/build-core-workflow-command-menu-item-updates.util';
import { buildGoToWorkflowsCommandMenuItemToCreate } from 'src/database/commands/upgrade-version-command/2-46/utils/build-go-to-workflows-command-menu-item-to-create.util';
import { buildWorkflowsNavigationLinkToCreate } from 'src/database/commands/upgrade-version-command/2-46/utils/build-workflows-navigation-link-to-create.util';
import { LEGACY_WORKFLOWS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-46/constants/legacy-workflow-object-universal-identifiers.constant';
import { collectLegacyWorkflowMetadataToDelete } from 'src/database/commands/upgrade-version-command/2-46/utils/collect-legacy-workflow-metadata-to-delete.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.46.0', 1791318264622)
@Command({
  name: 'upgrade:2-46:drop-legacy-workflow-objects',
  description:
    'Finish the core aliases of workspace workflows, versions and runs, re-home the workflow commands and navigation, then drop the workflow, workflowVersion and workflowAutomatedTrigger objects',
})
export class DropLegacyWorkflowObjectsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    if (isDefined(dataSource)) {
      await this.backfillCoreAliases({ workspaceId, dataSource, isDryRun });
    }

    if (isDryRun) {
      return;
    }

    await this.rehomeCoreWorkflowCommands(workspaceId);
    await this.dropLegacyWorkflowMetadata(workspaceId);
    await this.createGoToWorkflowsCommandMenuItem(workspaceId);

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatWorkflowMaps',
      'flatWorkflowVersionMaps',
      'workflowAutomatedTriggerMaps',
    ]);
  }

  private async backfillCoreAliases({
    workspaceId,
    dataSource,
    isDryRun,
  }: {
    workspaceId: string;
    dataSource: DataSource;
    isDryRun: boolean;
  }): Promise<void> {
    const schema = getWorkspaceSchemaName(workspaceId);
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      if (
        !(await queryRunner.hasTable(`${schema}.workflow`)) ||
        !(await queryRunner.hasTable(`${schema}.workflowVersion`))
      ) {
        return;
      }

      await queryRunner.startTransaction();

      const [, createdCoreWorkflowCount] = await queryRunner.query(
        `WITH "createdCoreWorkflows" AS (
           INSERT INTO core."workflow"
             (id, "workspaceId", "universalIdentifier", "applicationId", name, "lastPublishedVersionId", "workspaceWorkflowId")
           SELECT gen_random_uuid(), $1, gen_random_uuid(), workspace."workspaceCustomApplicationId",
             w.name, NULLIF(w."lastPublishedVersionId", '')::uuid, w.id
           FROM "${schema}"."workflow" w
           JOIN core."workspace" workspace ON workspace.id = $1
           WHERE w."deletedAt" IS NULL AND w."coreWorkflowId" IS NULL
             AND NOT EXISTS (
               SELECT 1 FROM core."workflow" existing
               WHERE existing."workspaceId" = $1 AND existing."workspaceWorkflowId" = w.id
             )
           RETURNING id, "workspaceWorkflowId"
         )
         UPDATE "${schema}"."workflow" w
         SET "coreWorkflowId" = "createdCoreWorkflows".id
         FROM "createdCoreWorkflows"
         WHERE w.id = "createdCoreWorkflows"."workspaceWorkflowId"`,
        [workspaceId],
      );

      const [, aliasedCoreWorkflowCount] = await queryRunner.query(
        `UPDATE core."workflow" cw
         SET "workspaceWorkflowId" = w.id
         FROM "${schema}"."workflow" w
         WHERE cw."workspaceId" = $1 AND cw.id = w."coreWorkflowId"
           AND cw."workspaceWorkflowId" IS NULL
           AND NOT EXISTS (
             SELECT 1 FROM core."workflow" other
             WHERE other."workspaceId" = $1 AND other."workspaceWorkflowId" = w.id
           )`,
        [workspaceId],
      );

      const [, createdCoreVersionCount] = await queryRunner.query(
        `WITH "createdCoreVersions" AS (
           INSERT INTO core."workflowVersion"
             (id, "workspaceId", "universalIdentifier", "applicationId", triggers, steps, status, "workflowId", "coreWorkflowId", "workspaceWorkflowVersionId")
           SELECT gen_random_uuid(), $1, gen_random_uuid(), workspace."workspaceCustomApplicationId",
             CASE WHEN wv.trigger IS NULL THEN NULL ELSE jsonb_build_array(wv.trigger) END,
             wv.steps, wv.status::text::core."workflowVersion_status_enum", wv."workflowId", cw.id, wv.id
           FROM "${schema}"."workflowVersion" wv
           JOIN core."workspace" workspace ON workspace.id = $1
           JOIN core."workflow" cw ON cw."workspaceId" = $1 AND cw."workspaceWorkflowId" = wv."workflowId"
           WHERE wv."deletedAt" IS NULL AND wv."coreWorkflowVersionId" IS NULL
             AND NOT EXISTS (
               SELECT 1 FROM core."workflowVersion" existing
               WHERE existing."workspaceId" = $1 AND existing."workspaceWorkflowVersionId" = wv.id
             )
           RETURNING id, "workspaceWorkflowVersionId"
         )
         UPDATE "${schema}"."workflowVersion" wv
         SET "coreWorkflowVersionId" = "createdCoreVersions".id
         FROM "createdCoreVersions"
         WHERE wv.id = "createdCoreVersions"."workspaceWorkflowVersionId"`,
        [workspaceId],
      );

      const [, aliasedCoreVersionCount] = await queryRunner.query(
        `UPDATE core."workflowVersion" cv
         SET "workspaceWorkflowVersionId" = wv.id
         FROM "${schema}"."workflowVersion" wv
         WHERE cv."workspaceId" = $1 AND cv.id = wv."coreWorkflowVersionId"
           AND cv."workspaceWorkflowVersionId" IS NULL
           AND NOT EXISTS (
             SELECT 1 FROM core."workflowVersion" other
             WHERE other."workspaceId" = $1 AND other."workspaceWorkflowVersionId" = wv.id
           )`,
        [workspaceId],
      );

      await queryRunner.query(
        `UPDATE core."workflow" cw SET "lastPublishedCoreWorkflowVersionId" = cv.id
         FROM core."workflowVersion" cv
         WHERE cw."workspaceId" = $1 AND cv."workspaceId" = $1
           AND cv."workspaceWorkflowVersionId" = cw."lastPublishedVersionId"
           AND cv."coreWorkflowId" = cw.id AND cw."lastPublishedCoreWorkflowVersionId" IS NULL`,
        [workspaceId],
      );

      const [, mappedRunVersionCount] = await queryRunner.query(
        `UPDATE "${schema}"."workflowRun" r
         SET "coreWorkflowVersionId" = cv.id
         FROM core."workflowVersion" cv
         WHERE cv."workspaceId" = $1 AND cv."workspaceWorkflowVersionId" = r."workflowVersionId"
           AND NOT EXISTS (
             SELECT 1 FROM core."workflowVersion" "storedVersion"
             WHERE "storedVersion".id = r."coreWorkflowVersionId"
           )`,
        [workspaceId],
      );

      const [, mappedRunWorkflowFromVersionCount] = await queryRunner.query(
        `UPDATE "${schema}"."workflowRun" r
         SET "coreWorkflowId" = cv."coreWorkflowId"
         FROM core."workflowVersion" cv
         WHERE cv."workspaceId" = $1 AND cv.id = r."coreWorkflowVersionId"
           AND cv."coreWorkflowId" IS NOT NULL
           AND NOT EXISTS (
             SELECT 1 FROM core."workflow" "storedWorkflow"
             WHERE "storedWorkflow".id = r."coreWorkflowId"
           )`,
        [workspaceId],
      );

      const [, mappedRunWorkflowCount] = await queryRunner.query(
        `UPDATE "${schema}"."workflowRun" r
         SET "coreWorkflowId" = cw.id
         FROM core."workflow" cw
         WHERE cw."workspaceId" = $1 AND cw."workspaceWorkflowId" = r."workflowId"
           AND NOT EXISTS (
             SELECT 1 FROM core."workflow" "storedWorkflow"
             WHERE "storedWorkflow".id = r."coreWorkflowId"
           )`,
        [workspaceId],
      );

      const unmappedPendingRuns: { id: string }[] = await queryRunner.query(
        `SELECT r.id FROM "${schema}"."workflowRun" r
         LEFT JOIN core."workflowVersion" cv ON cv.id = r."coreWorkflowVersionId" AND cv."workspaceId" = $1
         LEFT JOIN core."workflow" cw ON cw.id = r."coreWorkflowId" AND cw."workspaceId" = $1
         WHERE r."deletedAt" IS NULL
           AND r.status IN ('NOT_STARTED', 'ENQUEUED', 'RUNNING', 'STOPPING')
           AND (cv.id IS NULL OR cw.id IS NULL OR cv."coreWorkflowId" <> cw.id)
           AND EXISTS (
             SELECT 1 FROM "${schema}"."workflowVersion" wv
             WHERE wv.id = r."workflowVersionId" AND wv."deletedAt" IS NULL
           )
         LIMIT 10`,
        [workspaceId],
      );

      if (unmappedPendingRuns.length > 0) {
        throw new Error(
          `Pending workflow runs have no core workflow mapping in workspace ${workspaceId}: ${unmappedPendingRuns
            .map(({ id }) => id)
            .join(', ')}`,
        );
      }

      const counts = {
        createdCoreWorkflowCount,
        aliasedCoreWorkflowCount,
        createdCoreVersionCount,
        aliasedCoreVersionCount,
        mappedRunVersionCount,
        mappedRunWorkflowCount:
          mappedRunWorkflowFromVersionCount + mappedRunWorkflowCount,
      };

      if (isDryRun) {
        await queryRunner.rollbackTransaction();

        this.logger.log(
          `[DRY RUN] Would finish core workflow aliases in workspace ${workspaceId}: ${JSON.stringify(counts)}`,
        );

        return;
      }

      await queryRunner.commitTransaction();

      this.logger.log(
        `Finished core workflow aliases in workspace ${workspaceId}: ${JSON.stringify(counts)}`,
      );
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async rehomeCoreWorkflowCommands(workspaceId: string): Promise<void> {
    const { flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const commandMenuItemsToUpdate = buildCoreWorkflowCommandMenuItemUpdates({
      flatCommandMenuItemsByUniversalIdentifier:
        flatCommandMenuItemMaps.byUniversalIdentifier,
      now: new Date().toISOString(),
    });

    if (commandMenuItemsToUpdate.length === 0) {
      return;
    }

    await this.runLegacyMigration({
      workspaceId,
      failureMessage: 'Failed to re-home the workflow commands',
      allFlatEntityOperationByMetadataName: {
        commandMenuItem: {
          flatEntityToCreate: [],
          flatEntityToDelete: [],
          flatEntityToUpdate: commandMenuItemsToUpdate,
        },
      },
    });

    this.logger.log(
      `Re-homed ${commandMenuItemsToUpdate.length} workflow command(s) in workspace ${workspaceId}`,
    );
  }

  private async dropLegacyWorkflowMetadata(workspaceId: string): Promise<void> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      flatPageLayoutWidgetMaps,
      flatViewMaps,
      flatNavigationMenuItemMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatPageLayoutWidgetMaps',
      'flatViewMaps',
      'flatNavigationMenuItemMaps',
    ]);

    const {
      flatObjectMetadatasToDelete,
      flatFieldMetadatasToDelete,
      flatIndexMetadatasToDelete,
      flatPageLayoutWidgetsToDelete,
      flatNavigationMenuItemsToDelete,
    } = collectLegacyWorkflowMetadataToDelete({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      flatPageLayoutWidgetMaps,
      flatViewMaps,
      flatNavigationMenuItemMaps,
    });

    if (
      flatObjectMetadatasToDelete.length === 0 &&
      flatFieldMetadatasToDelete.length === 0 &&
      flatPageLayoutWidgetsToDelete.length === 0
    ) {
      this.logger.log(
        `Legacy workflow objects already absent in workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const legacyWorkflowsNavigationMenuItem =
      flatNavigationMenuItemsToDelete.find(
        ({ universalIdentifier }) =>
          universalIdentifier ===
          LEGACY_WORKFLOWS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
      );

    const workflowsNavigationLinkToCreate = isDefined(
      legacyWorkflowsNavigationMenuItem,
    )
      ? buildWorkflowsNavigationLinkToCreate({
          legacyWorkflowsNavigationMenuItem,
          now: new Date().toISOString(),
        })
      : undefined;

    await this.runLegacyMigration({
      workspaceId,
      failureMessage: 'Failed to drop the legacy workflow objects',
      allFlatEntityOperationByMetadataName: {
        navigationMenuItem: {
          flatEntityToCreate: isDefined(workflowsNavigationLinkToCreate)
            ? [workflowsNavigationLinkToCreate]
            : [],
          flatEntityToDelete: flatNavigationMenuItemsToDelete,
          flatEntityToUpdate: [],
        },
        pageLayoutWidget: {
          flatEntityToCreate: [],
          flatEntityToDelete: flatPageLayoutWidgetsToDelete,
          flatEntityToUpdate: [],
        },
        index: {
          flatEntityToCreate: [],
          flatEntityToDelete: flatIndexMetadatasToDelete,
          flatEntityToUpdate: [],
        },
        fieldMetadata: {
          flatEntityToCreate: [],
          flatEntityToDelete: flatFieldMetadatasToDelete,
          flatEntityToUpdate: [],
        },
        objectMetadata: {
          flatEntityToCreate: [],
          flatEntityToDelete: flatObjectMetadatasToDelete,
          flatEntityToUpdate: [],
        },
      },
    });

    this.logger.log(
      `Dropped ${flatObjectMetadatasToDelete.length} legacy workflow object(s), ${flatFieldMetadatasToDelete.length} field(s), ${flatIndexMetadatasToDelete.length} index(es), ${flatPageLayoutWidgetsToDelete.length} widget(s) and ${flatNavigationMenuItemsToDelete.length} navigation item(s)${isDefined(workflowsNavigationLinkToCreate) ? ', and linked the Workflows navigation item to /workflows' : ''} in workspace ${workspaceId}`,
    );
  }

  private async createGoToWorkflowsCommandMenuItem(
    workspaceId: string,
  ): Promise<void> {
    const { flatCommandMenuItemMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
        'flatObjectMetadataMaps',
      ]);

    const goToWorkflowsCommandMenuItem =
      buildGoToWorkflowsCommandMenuItemToCreate({
        flatCommandMenuItemsByUniversalIdentifier:
          flatCommandMenuItemMaps.byUniversalIdentifier,
        flatObjectMetadataMaps,
        workspaceId,
        now: new Date().toISOString(),
      });

    if (!isDefined(goToWorkflowsCommandMenuItem)) {
      return;
    }

    await this.runLegacyMigration({
      workspaceId,
      failureMessage: 'Failed to create the Go to Workflows command',
      allFlatEntityOperationByMetadataName: {
        commandMenuItem: {
          flatEntityToCreate: [goToWorkflowsCommandMenuItem],
          flatEntityToDelete: [],
          flatEntityToUpdate: [],
        },
      },
    });

    this.logger.log(
      `Created the Go to Workflows command in workspace ${workspaceId}`,
    );
  }

  private async runLegacyMigration({
    workspaceId,
    failureMessage,
    allFlatEntityOperationByMetadataName,
  }: {
    workspaceId: string;
    failureMessage: string;
    allFlatEntityOperationByMetadataName: AllFlatEntityOperationByMetadataName;
  }): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName,
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result, failureMessage);
    }
  }
}
