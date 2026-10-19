import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FIELD_TYPE_DEFAULT_ICONS } from 'twenty-shared/constants';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const FIELD_WITHOUT_ICON_CONDITION = `field."workspaceId" = $1 AND (field.icon IS NULL OR btrim(field.icon) = '')`;

@RegisteredWorkspaceCommand('2.50.0', 1792432627443)
@Command({
  name: 'upgrade:2-50:backfill-field-metadata-default-icons',
  description:
    'Give every field without an icon the default icon of its field type',
})
export class BackfillFieldMetadataDefaultIconsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (options.dryRun) {
      const [{ fieldCount }]: { fieldCount: number }[] =
        await this.coreDataSource.query(
          `SELECT count(*)::int AS "fieldCount" FROM core."fieldMetadata" AS field WHERE ${FIELD_WITHOUT_ICON_CONDITION}`,
          [workspaceId],
        );

      if (fieldCount > 0) {
        this.logger.log(
          `[DRY RUN] Workspace ${workspaceId}: would set the default icon of ${fieldCount} field(s)`,
        );
      }

      return;
    }

    const [, updatedFieldCount]: [unknown, number] =
      await this.coreDataSource.query(
        `UPDATE core."fieldMetadata" AS field SET icon = "defaultIcon".icon FROM jsonb_each_text($2::jsonb) AS "defaultIcon"(type, icon) WHERE field.type = "defaultIcon".type AND ${FIELD_WITHOUT_ICON_CONDITION}`,
        [workspaceId, JSON.stringify(FIELD_TYPE_DEFAULT_ICONS)],
      );

    if (updatedFieldCount === 0) {
      return;
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatFieldMetadataMaps',
    ]);

    this.logger.log(
      `Workspace ${workspaceId}: set the default icon of ${updatedFieldCount} field(s)`,
    );
  }
}
