import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  computeCustomFieldMetadataOptionMarks,
  type EnumFieldToMark,
  type OptionRowToMark,
} from 'src/database/commands/upgrade-version-command/2-59/utils/compute-custom-field-metadata-option-marks.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { withDerivedFieldMetadataMaps } from 'src/engine/metadata-modules/flat-entity/utils/with-derived-field-metadata-maps.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

@RegisteredWorkspaceCommand('2.59.0', 1794479900000)
@Command({
  name: 'upgrade:2-59:mark-custom-field-metadata-options',
  description:
    "Mark the options a workspace added to another application's select fields, so they stay removable while the application's own options can only be deactivated.",
})
export class MarkCustomFieldMetadataOptionsCommand extends ProvisionedWorkspaceCommandRunner {
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

    const result = await this.coreDataSource.transaction(
      async (entityManager) => {
        const enumFields: EnumFieldToMark[] = await entityManager.query(
          `SELECT id, "universalIdentifier", "applicationId", options FROM core."fieldMetadata"
            WHERE "workspaceId" = $1 AND type IN ('SELECT', 'MULTI_SELECT', 'RATING')
            ORDER BY id FOR UPDATE`,
          [workspaceId],
        );
        const optionRows: OptionRowToMark[] = await entityManager.query(
          `SELECT id, "universalIdentifier", "fieldMetadataId", "applicationId", value
            FROM core."fieldMetadataOption" WHERE "workspaceId" = $1`,
          [workspaceId],
        );

        const {
          optionRowIdsToMoveToWorkspaceCustomApplication,
          optionsToRewriteByFieldMetadataId,
        } = computeCustomFieldMetadataOptionMarks({
          enumFields,
          optionRows,
          standardOptionValuesByFieldUniversalIdentifier,
          twentyStandardApplicationId: twentyStandardFlatApplication.id,
        });

        if (!isDryRun) {
          await entityManager.query(
            `UPDATE core."fieldMetadataOption" SET "applicationId" = $1, "updatedAt" = now()
              WHERE "workspaceId" = $2 AND id = ANY($3::uuid[])`,
            [
              workspaceCustomFlatApplication.id,
              workspaceId,
              optionRowIdsToMoveToWorkspaceCustomApplication,
            ],
          );
          await entityManager.query(
            `UPDATE core."fieldMetadata" AS field SET options = rewrite.options
              FROM jsonb_to_recordset($1::jsonb) AS rewrite(id uuid, options jsonb)
              WHERE field.id = rewrite.id AND field."workspaceId" = $2`,
            [
              JSON.stringify(
                [...optionsToRewriteByFieldMetadataId].map(
                  ([fieldMetadataId, rewrittenOptions]) => ({
                    id: fieldMetadataId,
                    options: rewrittenOptions,
                  }),
                ),
              ),
              workspaceId,
            ],
          );
        }

        return {
          movedRowCount: optionRowIdsToMoveToWorkspaceCustomApplication.length,
          markedFieldCount: optionsToRewriteByFieldMetadataId.size,
        };
      },
    );

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${result.markedFieldCount} field(s) with custom options marked, ${result.movedRowCount} option row(s) moved to the workspace application`,
    );

    if (isDryRun || result.markedFieldCount + result.movedRowCount === 0) {
      return;
    }

    await this.workspaceCacheService.invalidateAndRecompute(
      workspaceId,
      withDerivedFieldMetadataMaps([
        'flatFieldMetadataMaps',
        'flatFieldMetadataOptionMaps',
      ]),
    );
  }
}
