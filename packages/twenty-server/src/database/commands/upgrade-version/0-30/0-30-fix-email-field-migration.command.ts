import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { isDefined } from 'class-validator';
import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { PERSON_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { ViewService } from 'src/modules/view/services/view.service';
@Command({
  name: 'upgrade-0.30:fix-email-field-migration',
  description:
    'Fix migration - delete deprecated email fields and add emails to person views',
})
export class FixEmailFieldsToEmailsCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly typeORMService: TypeORMService,
    private readonly dataSourceService: DataSourceService,
    private readonly viewService: ViewService,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    _options: ActiveWorkspacesCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log('Running command to fix migration');

    for (const workspaceId of workspaceIds) {
      let dataSourceMetadata;

      this.logger.log(`Running command for workspace ${workspaceId}`);
      try {
        dataSourceMetadata =
          await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceId(
            workspaceId,
          );

        if (!dataSourceMetadata) {
          throw new Error(
            `Could not find dataSourceMetadata for workspace ${workspaceId}`,
          );
        }

        const workspaceDataSource =
          await this.typeORMService.connectToDataSource(dataSourceMetadata);

        if (!workspaceDataSource) {
          throw new Error(
            `Could not connect to dataSource for workspace ${workspaceId}`,
          );
        }
      } catch (error) {
        this.logger.log(
          chalk.red(
            `Could not connect to workspace data source for workspace ${workspaceId}`,
          ),
        );
        continue;
      }

      try {
        const deprecatedPersonEmailFieldsMetadata =
          await this.fieldMetadataRepository.findBy({
            standardId: PERSON_STANDARD_FIELD_IDS.email,
            workspaceId: workspaceId,
          });

        const migratedEmailFieldMetadata = await this.fieldMetadataRepository
          .findBy({
            standardId: PERSON_STANDARD_FIELD_IDS.emails,
            workspaceId: workspaceId,
          })
          .then((fields) => fields[0]);

        const personEmailFieldWasMigratedButHasDuplicate =
          deprecatedPersonEmailFieldsMetadata.length > 0 &&
          isDefined(migratedEmailFieldMetadata);

        if (!personEmailFieldWasMigratedButHasDuplicate) {
          this.logger.log(
            chalk.yellow('No fields to migrate for workspace ' + workspaceId),
          );
          continue;
        }

        for (const deprecatedEmailFieldMetadata of deprecatedPersonEmailFieldsMetadata) {
          await this.fieldMetadataService.deleteOneField(
            { id: deprecatedEmailFieldMetadata.id },
            workspaceId,
          );
          this.logger.log(
            chalk.green(`Deleted email field for workspace ${workspaceId}.`),
          );
        }

        const personObjectMetadaIdForWorkspace =
          migratedEmailFieldMetadata.objectMetadataId;

        if (!isDefined(personObjectMetadaIdForWorkspace)) {
          this.logger.log(
            chalk.red(
              `Could not find person object for workspace ${workspaceId}. Could not add emails to person view`,
            ),
          );
          continue;
        }

        const personViewsIds =
          await this.viewService.getViewsIdsForObjectMetadataId({
            workspaceId,
            objectMetadataId: personObjectMetadaIdForWorkspace as string,
          });

        await this.viewService.addFieldToViews({
          workspaceId: workspaceId,
          fieldId: migratedEmailFieldMetadata.id,
          viewsIds: personViewsIds,
          positions: personViewsIds.reduce((acc, personView) => {
            if (!personView.id) {
              return acc;
            }
            acc[personView.id] = 4;

            return acc;
          }, []),
        });
        this.logger.log(chalk.green(`Added emails to view ${workspaceId}.`));
      } catch (error) {
        this.logger.log(
          chalk.red(
            `Running command on workspace ${workspaceId} failed with error: ${error}`,
          ),
        );
        continue;
      } finally {
        this.logger.log(
          chalk.green(`Finished running command for workspace ${workspaceId}.`),
        );
      }

      this.logger.log(chalk.green(`Command completed!`));
    }
  }
}
