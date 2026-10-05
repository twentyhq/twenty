import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { convertWorkflowEmailBodiesToEmailDocuments } from 'src/database/commands/upgrade-version-command/2-46/utils/convert-workflow-email-bodies-to-email-documents.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

@RegisteredWorkspaceCommand('2.46.0', 1791184540980)
@Command({
  name: 'upgrade:2-46:convert-workflow-email-bodies-to-email-documents',
  description:
    'Store HTML, plain text and versionless email bodies of workflow send/draft email steps as canonical email documents, rendering exactly as before',
})
export class ConvertWorkflowEmailBodiesToEmailDocumentsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
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
        `No data source for workspace ${workspaceId}, skipping email body conversion`,
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
          STANDARD_OBJECTS.workflowVersion.universalIdentifier,
      });

    if (!isDefined(workflowVersionObject)) {
      return;
    }

    const workflowVersionRepository =
      await this.workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const allVersions = await workflowVersionRepository.find();

    const convertedVersions = allVersions.flatMap((version) => {
      const { value, hasChanged } = convertWorkflowEmailBodiesToEmailDocuments(
        version.steps,
      );

      return hasChanged ? [{ ...version, steps: value }] : [];
    });

    if (convertedVersions.length === 0) {
      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would convert email bodies in ${convertedVersions.length} workflow version(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const hasCoreWorkflowVersionIdField = isDefined(
      flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.workflowVersion.fields.coreWorkflowVersionId
          .universalIdentifier
      ],
    );

    if (hasCoreWorkflowVersionIdField) {
      await this.workflowVersionCoreSyncService.upsertToCore(
        workspaceId,
        convertedVersions,
      );
    } else {
      this.logger.warn(
        `workflowVersion.coreWorkflowVersionId is missing for workspace ${workspaceId}, skipping the core sync`,
      );
    }

    for (const version of convertedVersions) {
      await dataSource.query(
        `UPDATE "${getWorkspaceSchemaName(workspaceId)}"."workflowVersion" SET steps = $1::jsonb WHERE id = $2`,
        [JSON.stringify(version.steps), version.id],
      );
    }

    this.logger.log(
      `Converted email bodies in ${convertedVersions.length} workflow version(s) for workspace ${workspaceId}`,
    );
  }
}
