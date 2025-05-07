import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  jsonRelationFilterValueSchema,
} from 'twenty-shared/types';
import { In, Repository } from 'typeorm';

@Command({
  name: 'upgrade:0-54:standardize-relation-filter-syntax',
  description: 'Standardize relation filter syntax',
})
export class StandardizeRelationFilterSyntaxCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    index,
    total,
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    try {
      const viewFilterRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          'viewFilter',
          { shouldBypassPermissionChecks: true },
        );

      const relationFieldMetadata = await this.fieldMetadataRepository.find({
        where: {
          workspaceId,
          type: FieldMetadataType.RELATION,
        },
      });

      const relationFieldMetadataIds = relationFieldMetadata.map(
        (fieldMetadata) => fieldMetadata.id,
      );

      const relationViewFilters = await viewFilterRepository.find({
        where: {
          fieldMetadataId: In(relationFieldMetadataIds),
        },
      });

      for (const relationViewFilter of relationViewFilters) {
        if (!options.dryRun) {
          await viewFilterRepository.update(relationViewFilter.id, {
            ...relationViewFilter,
            value: this.convertRelationViewFilterValue(
              relationViewFilter.value,
            ),
          });
        }
      }

      this.logger.log(
        chalk.green(`Command completed for workspace ${workspaceId}.`),
      );
    } catch (error) {
      this.logger.error(
        `Error running command for workspace ${workspaceId}: ${error}`,
      );
      throw error;
    }
  }

  private convertRelationViewFilterValue(value: string): string {
    const jsonRelationFilterValueResult =
      jsonRelationFilterValueSchema.safeParse(value);

    if (!jsonRelationFilterValueResult.success) {
      return value;
    }

    const { selectedRecordIds, isCurrentWorkspaceMemberSelected } =
      jsonRelationFilterValueResult.data;

    if (isCurrentWorkspaceMemberSelected) {
      return JSON.stringify([
        ...selectedRecordIds,
        CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID,
      ]);
    }

    return JSON.stringify(selectedRecordIds);
  }
}
