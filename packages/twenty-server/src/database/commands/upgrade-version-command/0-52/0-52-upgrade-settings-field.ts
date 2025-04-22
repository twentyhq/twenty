import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { In, Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { DateDisplayFormat } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

type DeprecatedFieldMetadataDateSettings = {
  displayAsRelativeDate?: boolean;
};

@Command({
  name: 'upgrade:0-52:upgrade-date-and-date-time-field-settings',
  description: 'Upgrade settings column on all date and date time fields',
})
export class UpgradeDateAndDateTimeFieldsSettingsJsonCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    index,
    total,
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    const fieldMetadataCollection = (await this.fieldMetadataRepository.find({
      where: {
        workspaceId,
        type: In([FieldMetadataType.DATE, FieldMetadataType.DATE_TIME]),
      },
    })) as FieldMetadataEntity<FieldMetadataType.DATE>[];

    const updatedFieldMetadataCollection = fieldMetadataCollection.map(
      (field) => this.updateDateAndDateTimeFieldMetadata(field),
    );

    if (updatedFieldMetadataCollection.length > 0) {
      await this.fieldMetadataRepository.save(updatedFieldMetadataCollection);
    }

    this.logger.log(
      chalk.green(`Command completed for workspace ${workspaceId}.`),
    );
  }

  private updateDateAndDateTimeFieldMetadata(
    field: FieldMetadataEntity<FieldMetadataType.DATE>,
  ): FieldMetadataEntity<FieldMetadataType.DATE> {
    const settings = field.settings as DeprecatedFieldMetadataDateSettings;

    if (!isDefined(settings?.displayAsRelativeDate)) {
      return field;
    }

    return {
      ...field,
      settings: {
        displayFormat: settings.displayAsRelativeDate
          ? DateDisplayFormat.RELATIVE
          : DateDisplayFormat.USER_SETTINGS,
      },
    };
  }
}
