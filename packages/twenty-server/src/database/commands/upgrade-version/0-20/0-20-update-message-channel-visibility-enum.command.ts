import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';
import chalk from 'chalk';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { MessageChannelVisibility } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';

interface UpdateMessageChannelVisibilityEnumCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'migrate-0.20:update-message-channel-visibility-enum',
  description:
    'Change the messageChannel visibility type and update records.visibility',
})
export class UpdateMessageChannelVisibilityEnumCommand extends CommandRunner {
  private readonly logger = new Logger(
    UpdateMessageChannelVisibilityEnumCommand.name,
  );
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly typeORMService: TypeORMService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id. Command runs on all workspaces if not provided',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    _passedParam: string[],
    options: UpdateMessageChannelVisibilityEnumCommandOptions,
  ): Promise<void> {
    let workspaceIds: string[] = [];

    if (options.workspaceId) {
      workspaceIds = [options.workspaceId];
    } else {
      workspaceIds = (await this.workspaceRepository.find()).map(
        (workspace) => workspace.id,
      );
    }

    if (!workspaceIds.length) {
      this.logger.log(chalk.yellow('No workspace found'));

      return;
    } else {
      this.logger.log(
        chalk.green(`Running command on ${workspaceIds.length} workspaces`),
      );
    }

    for (const workspaceId of workspaceIds) {
      const dataSourceMetadatas =
        await this.dataSourceService.getDataSourcesMetadataFromWorkspaceId(
          workspaceId,
        );

      for (const dataSourceMetadata of dataSourceMetadatas) {
        const workspaceDataSource =
          await this.typeORMService.connectToDataSource(dataSourceMetadata);

        if (workspaceDataSource) {
          const queryRunner = workspaceDataSource.createQueryRunner();

          await queryRunner.connect();
          await queryRunner.startTransaction();
          const newMessageChannelVisibilities = Object.values(
            MessageChannelVisibility,
          );

          try {
            await queryRunner.query(
              `ALTER TYPE "${dataSourceMetadata.schema}"."messageChannel_visibility_enum" RENAME TO "messageChannel_visibility_enum_old"`,
            );
            await queryRunner.query(
              `CREATE TYPE "${
                dataSourceMetadata.schema
              }"."messageChannel_visibility_enum" AS ENUM ('${newMessageChannelVisibilities.join(
                "','",
              )}')`,
            );
            await queryRunner.query(
              `ALTER TABLE "${dataSourceMetadata.schema}"."messageChannel" ALTER COLUMN "visibility" DROP DEFAULT`,
            );
            await queryRunner.query(
              `ALTER TABLE "${dataSourceMetadata.schema}"."messageChannel" ALTER COLUMN "visibility" TYPE text`,
            );
            for (const newMessageChannelVisibility of newMessageChannelVisibilities) {
              await queryRunner.query(
                `UPDATE "${
                  dataSourceMetadata.schema
                }"."messageChannel" SET "visibility" = '${newMessageChannelVisibility}' WHERE "visibility" = '${newMessageChannelVisibility.toLowerCase()}'`,
              );
            }
            await queryRunner.query(
              `ALTER TABLE "${dataSourceMetadata.schema}"."messageChannel" ALTER COLUMN "visibility" TYPE "${dataSourceMetadata.schema}"."messageChannel_visibility_enum" USING "visibility"::text::"${dataSourceMetadata.schema}"."messageChannel_visibility_enum"`,
            );
            await queryRunner.query(
              `ALTER TABLE "${dataSourceMetadata.schema}"."messageChannel" ALTER COLUMN "visibility" SET DEFAULT '${MessageChannelVisibility.SHARE_EVERYTHING}'`,
            );
            await queryRunner.query(
              `DROP TYPE "${dataSourceMetadata.schema}"."messageChannel_visibility_enum_old"`,
            );
            await queryRunner.commitTransaction();
          } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.log(
              chalk.red(`Running command on workspace ${workspaceId} failed`),
            );
            throw error;
          } finally {
            await queryRunner.release();
          }
        }
      }
      await this.workspaceCacheVersionService.incrementVersion(workspaceId);

      const visibilityFieldsMetadata = await this.fieldMetadataRepository.find({
        where: { name: 'visibility', workspaceId },
      });

      for (const visibilityFieldMetadata of visibilityFieldsMetadata) {
        const newOptions = visibilityFieldMetadata.options.map((option) => {
          return { ...option, value: option.value.toUpperCase() };
        });

        const newDefaultValue =
          typeof visibilityFieldMetadata.defaultValue === 'string'
            ? visibilityFieldMetadata.defaultValue.toUpperCase()
            : visibilityFieldMetadata.defaultValue;

        await this.fieldMetadataRepository.update(visibilityFieldMetadata.id, {
          defaultValue: newDefaultValue,
          options: newOptions,
        });
      }

      this.logger.log(
        chalk.green(`Running command on workspace ${workspaceId} done`),
      );
    }

    this.logger.log(chalk.green(`Command completed!`));
  }
}
