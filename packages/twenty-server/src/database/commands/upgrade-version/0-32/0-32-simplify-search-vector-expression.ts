import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { SearchService } from 'src/engine/metadata-modules/search/search.service';
import { SEARCH_FIELDS_FOR_CUSTOM_OBJECT } from 'src/engine/twenty-orm/custom.workspace-entity';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import {
  COMPANY_STANDARD_FIELD_IDS,
  CUSTOM_OBJECT_STANDARD_FIELD_IDS,
  OPPORTUNITY_STANDARD_FIELD_IDS,
  PERSON_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { SEARCH_FIELDS_FOR_COMPANY } from 'src/modules/company/standard-objects/company.workspace-entity';
import { SEARCH_FIELDS_FOR_OPPORTUNITY } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { SEARCH_FIELDS_FOR_PERSON } from 'src/modules/person/standard-objects/person.workspace-entity';

@Command({
  name: 'fix-0.32:simplify-search-vector-expression',
  description: 'Replace searchVector with simpler expression',
})
export class SimplifySearchVectorExpressionCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly searchService: SearchService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
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
      this.logger.log(`Running command for workspace ${workspaceId}`);

      try {
        const searchVectorFields = await this.fieldMetadataRepository.findBy({
          workspaceId: workspaceId,
          type: FieldMetadataType.TS_VECTOR,
        });

        for (const searchVectorField of searchVectorFields) {
          let fieldsUsedForSearch: FieldTypeAndNameMetadata[] = [];

          switch (searchVectorField.standardId) {
            case CUSTOM_OBJECT_STANDARD_FIELD_IDS.searchVector: {
              fieldsUsedForSearch = SEARCH_FIELDS_FOR_CUSTOM_OBJECT;
              break;
            }
            case PERSON_STANDARD_FIELD_IDS.searchVector: {
              fieldsUsedForSearch = SEARCH_FIELDS_FOR_PERSON;
              break;
            }
            case COMPANY_STANDARD_FIELD_IDS.searchVector: {
              fieldsUsedForSearch = SEARCH_FIELDS_FOR_COMPANY;
              break;
            }
            case OPPORTUNITY_STANDARD_FIELD_IDS.searchVector: {
              fieldsUsedForSearch = SEARCH_FIELDS_FOR_OPPORTUNITY;
              break;
            }
          }

          if (fieldsUsedForSearch.length === 0) {
            continue;
          }

          await this.searchService.updateSearchVector(
            searchVectorField.objectMetadataId,
            fieldsUsedForSearch,
            workspaceId,
          );

          await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
            workspaceId,
          );
        }
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
