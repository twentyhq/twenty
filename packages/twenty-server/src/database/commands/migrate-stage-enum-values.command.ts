import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/metadata/field-metadata/field-metadata.entity';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';

interface StageEnumValuesMigrationOptions {
  workspaceId: string;
  dryRun?: boolean;
}

@Command({
  name: 'database:migrate-opportunity-stage-values',
  description: 'Migrate stage enum values to uppercase values.',
})
export class MigrateOpportunityStageValuesCommand extends CommandRunner {
  private readonly logger = new Logger(
    MigrateOpportunityStageValuesCommand.name,
  );

  constructor(
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: StageEnumValuesMigrationOptions,
  ): Promise<void> {
    console.log('Migrating stage enum values');
    this.logger.log('Migrating stage enum values 2');
    try {
      await this.migrateStageFieldMetadata(
        options.workspaceId,
        options.dryRun ?? false,
      );
      await this.migrateWorkspaceStageEnumValues(
        options.workspaceId,
        options.dryRun ?? false,
      );
    } catch (error) {
      this.logger.error(error);

      return;
    }
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  @Option({
    flags: '-d, --dry-run',
    description: 'Dry run without applying changes',
    required: false,
  })
  dryRun(): boolean {
    return true;
  }

  private async migrateStageFieldMetadata(
    workspaceId: string,
    dryRun: boolean,
  ): Promise<void> {
    const stageFieldMetadata = await this.fieldMetadataRepository.findOne({
      where: {
        workspaceId,
        type: FieldMetadataType.SELECT,
        isCustom: false,
      },
    });

    if (!stageFieldMetadata) {
      throw new Error(
        'Stage field metadata not found for workspace ' + workspaceId,
      );
    }

    stageFieldMetadata.defaultValue = { value: 'NEW' };
    stageFieldMetadata.options = stageFieldMetadata.options.map((option) => {
      return {
        ...option,
        value: option.value.toUpperCase(),
      };
    });

    this.logger.log('Migrating stage field metadata', stageFieldMetadata);

    if (!dryRun) {
      await this.fieldMetadataRepository.save(stageFieldMetadata);
    }
  }

  private async migrateWorkspaceStageEnumValues(
    workspaceId: string,
    dryRun: boolean,
  ): Promise<void> {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    const opportunities = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}.'opportunity'`,
    );

    opportunities.forEach(async (opportunity: any) => {
      if (!opportunity?.stage) {
        this.logger.log('Opportunity has no stage', opportunity);

        return;
      }

      const newStage = opportunity.stage.toUpperCase();

      if (newStage === opportunity.stage) {
        this.logger.log('Stage value is already in uppercase', opportunity);

        return;
      }

      this.logger.log(
        `Migrating stage value ${opportunity.stage} to ${newStage} for opportunity id ${opportunity.id}`,
      );

      if (!dryRun) {
        await workspaceDataSource?.query(
          `UPDATE ${dataSourceMetadata.schema}.'opportunity'
                SET stage = ${newStage}
                WHERE id = '${opportunity.id}'`,
        );
      }
    });
  }
}
