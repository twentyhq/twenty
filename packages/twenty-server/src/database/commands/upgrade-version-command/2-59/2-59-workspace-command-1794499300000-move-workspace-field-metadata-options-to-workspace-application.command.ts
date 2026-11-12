import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  findWorkspaceAddedStandardOptionRowIds,
  type StandardEnumField,
  type StandardOptionRow,
} from 'src/database/commands/upgrade-version-command/2-59/utils/find-workspace-added-standard-option-row-ids.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

@RegisteredWorkspaceCommand('2.59.0', 1794499300000)
@Command({
  name: 'upgrade:2-59:move-workspace-field-metadata-options-to-workspace-application',
  description:
    'Give the workspace application the option rows a workspace added to standard select fields, which the 2.57 backfill assigned to the standard application.',
})
export class MoveWorkspaceFieldMetadataOptionsToWorkspaceApplicationCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
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

    const {
      allFlatEntityMaps: { flatFieldMetadataMaps: standardFlatFieldMetadataMaps },
    } = computeTwentyStandardApplicationAllFlatEntityMaps({
      now: new Date().toISOString(),
      workspaceId,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
    });

    const standardOptionValuesByFieldUniversalIdentifier = new Map(
      Object.values(standardFlatFieldMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter(isEnumFlatFieldMetadata)
        .map((standardFlatFieldMetadata) => [
          standardFlatFieldMetadata.universalIdentifier,
          new Set(standardFlatFieldMetadata.options.map(({ value }) => value)),
        ]),
    );

    const movedRowCount = await this.coreDataSource.transaction(
      async (entityManager) => {
        const standardEnumFields: StandardEnumField[] =
          await entityManager.query(
            `SELECT id, "universalIdentifier" FROM core."fieldMetadata"
              WHERE "workspaceId" = $1 AND "applicationId" = $2
                AND type IN ('SELECT', 'MULTI_SELECT', 'RATING')`,
            [workspaceId, twentyStandardFlatApplication.id],
          );
        const standardOptionRows: StandardOptionRow[] =
          await entityManager.query(
            `SELECT id, "fieldMetadataId", value FROM core."fieldMetadataOption"
              WHERE "workspaceId" = $1 AND "applicationId" = $2 FOR UPDATE`,
            [workspaceId, twentyStandardFlatApplication.id],
          );

        const optionRowIdsToMove = findWorkspaceAddedStandardOptionRowIds({
          standardEnumFields,
          standardOptionRows,
          standardOptionValuesByFieldUniversalIdentifier,
        });

        if (!isDryRun && optionRowIdsToMove.length > 0) {
          await entityManager.query(
            `UPDATE core."fieldMetadataOption" SET "applicationId" = $1, "updatedAt" = now()
              WHERE "workspaceId" = $2 AND id = ANY($3::uuid[])`,
            [workspaceCustomFlatApplication.id, workspaceId, optionRowIdsToMove],
          );
        }

        return optionRowIdsToMove.length;
      },
    );

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${movedRowCount} option row(s) moved to the workspace application`,
    );

    if (isDryRun || movedRowCount === 0) {
      return;
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatFieldMetadataOptionMaps',
    ]);
  }
}
