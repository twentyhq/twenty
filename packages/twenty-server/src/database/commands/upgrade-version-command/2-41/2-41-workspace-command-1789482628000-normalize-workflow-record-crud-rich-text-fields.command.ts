import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { upsertLegacyWorkflowVersionsToCore } from 'src/database/commands/upgrade-version-command/2-20/utils/upsert-legacy-workflow-versions-to-core.util';
import { LEGACY_WORKFLOW_VERSION_CORE_WORKFLOW_VERSION_ID_FIELD_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-22/constants/legacy-workflow-version-universal-identifiers.constant';
import { normalizeRecordCrudRichTextFieldsInSteps } from 'src/database/commands/upgrade-version-command/2-41/utils/normalize-record-crud-rich-text-fields.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type LegacyWorkflowVersionWorkspaceEntity } from 'src/database/commands/upgrade-version-command/2-20/types/legacy-workflow-version-workspace-entity.type';

@RegisteredWorkspaceCommand('2.41.0', 1789482628000)
@Command({
  name: 'upgrade:2-41:normalize-workflow-record-crud-rich-text-fields',
  description:
    'Normalize bare-string rich text field values into the { blocknote, markdown } object shape in workflow create/update/upsert record steps, which otherwise throws at runtime',
})
export class NormalizeWorkflowRecordCrudRichTextFieldsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    if (!isDefined(dataSource)) {
      this.logger.warn(
        `No data source for workspace ${workspaceId}, skipping backfill`,
      );

      return;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const workflowVersionObject =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workflowVersion,
      });

    if (!isDefined(workflowVersionObject)) {
      return;
    }

    const richTextFieldNamesByObjectName =
      this.buildRichTextFieldNamesByObjectName({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

    if (Object.keys(richTextFieldNamesByObjectName).length === 0) {
      return;
    }

    const workflowVersionRepository =
      await this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<LegacyWorkflowVersionWorkspaceEntity>(
        'workflowVersion');

    const allVersions = await workflowVersionRepository.find();

    const versionsToSyncToCore: LegacyWorkflowVersionWorkspaceEntity[] = [];
    let rewrittenCount = 0;

    for (const version of allVersions) {
      const { value, hasChanged, isRecordCrudRichTextCandidate } =
        normalizeRecordCrudRichTextFieldsInSteps({
          steps: version.steps,
          richTextFieldNamesByObjectName,
        });

      if (!isRecordCrudRichTextCandidate) {
        continue;
      }

      versionsToSyncToCore.push({ ...version, steps: value });

      if (!hasChanged) {
        continue;
      }

      rewrittenCount += 1;

      if (!isDryRun) {
        await dataSource.query(
          `UPDATE "${getWorkspaceSchemaName(workspaceId)}"."workflowVersion" SET steps = $1::jsonb WHERE id = $2`,
          [JSON.stringify(value), version.id],
        );
      }
    }

    if (versionsToSyncToCore.length === 0) {
      return;
    }

    const hasCoreWorkflowVersionIdField = isDefined(
      flatFieldMetadataMaps.byUniversalIdentifier[
        LEGACY_WORKFLOW_VERSION_CORE_WORKFLOW_VERSION_ID_FIELD_UNIVERSAL_IDENTIFIER
      ],
    );

    if (!hasCoreWorkflowVersionIdField) {
      this.logger.warn(
        `${isDryRun ? '[DRY RUN] ' : ''}Normalized rich text record fields in ${rewrittenCount} workflow version(s) for workspace ${workspaceId}; workflowVersion.coreWorkflowVersionId is missing, skipping the core sync`,
      );

      return;
    }

    if (!isDryRun) {
      await upsertLegacyWorkflowVersionsToCore({
        workspaceId,
        workflowVersions: versionsToSyncToCore,
        dependencies: {
          applicationService: this.applicationService,
          coreWorkflowVersionRepository: this.coreWorkflowVersionRepository,
          flatEntityMapsCacheService: this.flatEntityMapsCacheService,
          logger: this.logger,
          workspaceCacheService: this.workspaceCacheService,
          workspaceMigrationValidateBuildAndRunService:
            this.workspaceMigrationValidateBuildAndRunService,
          workspaceOrmManager: this.workspaceOrmManager,
          workspaceRepository: this.workspaceRepository,
        },
      });
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Normalized rich text record fields in ${rewrittenCount} workflow version(s) and synced ${versionsToSyncToCore.length} to core for workspace ${workspaceId}`,
    );
  }

  private buildRichTextFieldNamesByObjectName({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): Record<string, string[]> {
    const richTextFieldNamesByObjectName: Record<string, string[]> = {};

    for (const flatObjectMetadata of Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatObjectMetadata)) {
        continue;
      }

      const richTextFieldNames = findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: flatObjectMetadata.fieldIds,
        flatEntityMaps: flatFieldMetadataMaps,
      })
        .filter((field) => field.type === FieldMetadataType.RICH_TEXT)
        .map((field) => field.name);

      if (richTextFieldNames.length > 0) {
        richTextFieldNamesByObjectName[flatObjectMetadata.nameSingular] =
          richTextFieldNames;
      }
    }

    return richTextFieldNamesByObjectName;
  }
}
