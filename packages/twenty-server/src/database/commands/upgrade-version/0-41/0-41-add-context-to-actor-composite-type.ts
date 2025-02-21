import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared';
import { In, Repository, TableColumn } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { CommandLogger } from 'src/database/commands/logger';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Command({
  name: 'upgrade-0.41:add-context-to-actor-composite-type',
  description: 'Add context to actor composite type.',
})
export class AddContextToActorCompositeTypeCommand extends ActiveWorkspacesCommandRunner {
  protected readonly logger;

  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository);
    this.logger = new CommandLogger({
      constructorName: this.constructor.name,
      verbose: false,
    });
    this.logger.setVerbose(false);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    options: ActiveWorkspacesCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log(`Running add-context-to-actor-composite-type command`);

    if (options?.dryRun) {
      this.logger.log(chalk.yellow('Dry run mode: No changes will be applied'));
    }

    for (const workspaceId of workspaceIds) {
      try {
        await this.execute(workspaceId, options?.dryRun);
        this.logger.verbose(`Added for workspace: ${workspaceId}`);
      } catch (error) {
        this.logger.error(`Error for workspace: ${workspaceId}`, error);
      }
    }
  }

  private async execute(workspaceId: string, dryRun = false): Promise<void> {
    this.logger.verbose(`Adding for workspace: ${workspaceId}`);
    const actorFields = await this.fieldMetadataRepository.find({
      where: {
        type: FieldMetadataType.ACTOR,
        workspaceId,
      },
      relations: ['object'],
    });

    // Filter and update fields with EMAIL or CALENDAR source
    for (const field of actorFields) {
      if (!field || !field.object) {
        this.logger.verbose(
          'field.objectMetadata is null',
          workspaceId,
          field.id,
        );
        continue;
      }

      await this.addContextColumn(
        field,
        `${field.name}Context`,
        workspaceId,
        dryRun,
      );

      const fieldRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          field.object.nameSingular,
        );

      if (!dryRun) {
        const rowsToUpdate = await fieldRepository.update(
          {
            [field.name + 'Source']: In([
              FieldActorSource.EMAIL,
              FieldActorSource.CALENDAR,
            ]),
            [field.name + 'Context']: {},
          },
          {
            [field.name + 'Context']: {
              provider: 'google',
            },
          },
        );

        this.logger.verbose(
          `updated ${rowsToUpdate ? rowsToUpdate.affected : 0} rows`,
        );
      }
    }

    if (!dryRun) {
      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );
    }

    await this.twentyORMGlobalManager.destroyDataSourceForWorkspace(
      workspaceId,
    );
  }

  private async addContextColumn(
    field: FieldMetadataEntity,
    newColumnName: string,
    workspaceId: string,
    dryRun = false,
  ): Promise<void> {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    if (!workspaceDataSource) {
      this.logger.verbose('No workspace data source found');

      return;
    }

    const queryRunner = workspaceDataSource?.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const schemaName =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    try {
      const hasColumn = await queryRunner.hasColumn(
        `${schemaName}.${computeTableName(
          field.object.nameSingular,
          field?.object?.isCustom,
        )}`,
        newColumnName,
      );

      if (hasColumn) {
        return;
      }

      if (!dryRun) {
        await queryRunner.addColumn(
          `${schemaName}.${computeTableName(
            field.object.nameSingular,
            field?.object?.isCustom,
          )}`,
          new TableColumn({
            name: newColumnName,
            type: 'jsonb',
            default: `'{}'::"jsonb"`,
            isNullable: true,
          }),
        );

        await queryRunner.commitTransaction();
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
