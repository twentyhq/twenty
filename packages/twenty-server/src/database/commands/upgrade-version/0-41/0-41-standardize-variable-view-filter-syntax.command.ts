import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared';
import { In, Repository } from 'typeorm';
import { z } from 'zod';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { isCommandLogger } from 'src/database/commands/logger';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';

const relationFilterValueSchemaObject = z.object({
  isCurrentWorkspaceMemberSelected: z.boolean().optional(),
  selectedRecordIds: z.array(z.string()),
});

const jsonRelationFilterValueSchema = z
  .string()
  .transform((value, ctx) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: (error as Error).message,
      });

      return z.NEVER;
    }
  })
  .pipe(relationFilterValueSchemaObject);

@Command({
  name: 'upgrade-0.41:standardize-variable-view-filter-syntax',
  description: 'Standardize variable view filter syntax',
})
export class StandardizeVariableViewFilterSyntaxCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    options: ActiveWorkspacesCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log(
      'Running command to standardize view filter syntax for relation filters',
    );

    if (isCommandLogger(this.logger)) {
      this.logger.setVerbose(options.verbose ?? false);
    }

    let workspaceIterator = 1;

    for (const workspaceId of workspaceIds) {
      this.logger.log(
        `Running command for workspace ${workspaceId} ${workspaceIterator}/${workspaceIds.length}`,
      );

      try {
        const viewFilterRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace(
            workspaceId,
            'viewFilter',
            false,
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
          await viewFilterRepository.update(relationViewFilter.id, {
            ...relationViewFilter,
            value: this.convertRelationViewFilterValue(
              relationViewFilter.value,
            ),
          });
        }

        await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
          workspaceId,
        );

        await this.workspaceMetadataVersionService.incrementMetadataVersion(
          workspaceId,
        );

        workspaceIterator++;
        this.logger.log(
          chalk.green(`Command completed for workspace ${workspaceId}.`),
        );
      } catch (error) {
        this.logger.error(
          `Error running command for workspace ${workspaceId}: ${error}`,
        );
      }
    }
    this.logger.log(chalk.green(`Command completed!`));
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
        '{{CURRENT_WORKSPACE_MEMBER}}',
      ]);
    }

    return JSON.stringify(selectedRecordIds);
  }
}
