import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { isCommandLogger } from 'src/database/commands/logger';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationFactory } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.factory';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { isDefined } from 'src/utils/is-defined';

@Command({
  name: 'upgrade-0.35:phone-calling-code-create-column',
  description: 'Create the callingCode column',
})
export class PhoneCallingCodeCreateColumnCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    options: ActiveWorkspacesCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log(
      'Running command to add calling code and change country code with default one',
    );
    if (isCommandLogger(this.logger)) {
      this.logger.setVerbose(options.verbose ?? false);
    }

    this.logger.verbose(`Part 1 - Workspace`);
    let workspaceIterator = 1;

    for (const workspaceId of workspaceIds) {
      this.logger.verbose(
        `Running command for workspace ${workspaceId} ${workspaceIterator}/${workspaceIds.length}`,
      );

      this.logger.verbose(
        `P1 Step 1 - let's find all the fieldsMetadata that have the PHONES type, and extract the objectMetadataId`,
      );

      try {
        const phonesFieldMetadata = await this.fieldMetadataRepository.find({
          where: {
            workspaceId,
            type: FieldMetadataType.PHONES,
          },
          relations: ['object'],
        });

        for (const phoneFieldMetadata of phonesFieldMetadata) {
          if (
            isDefined(phoneFieldMetadata?.name) &&
            isDefined(phoneFieldMetadata.object)
          ) {
            this.logger.verbose(
              `P1 Step 1 - Let's find the "nameSingular" of this objectMetadata: ${phoneFieldMetadata.object.nameSingular || 'not found'}`,
            );

            if (!phoneFieldMetadata.object?.nameSingular) continue;

            this.logger.verbose(
              `P1 Step 1 - Create migration for field ${phoneFieldMetadata.name}`,
            );

            if (options.dryRun) {
              continue;
            }
            await this.workspaceMigrationService.createCustomMigration(
              generateMigrationName(
                `create-${phoneFieldMetadata.object.nameSingular}PrimaryPhoneCallingCode-for-field-${phoneFieldMetadata.name}`,
              ),
              workspaceId,
              [
                {
                  name: computeObjectTargetTable(phoneFieldMetadata.object),
                  action: WorkspaceMigrationTableActionType.ALTER,
                  columns: this.workspaceMigrationFactory.createColumnActions(
                    WorkspaceMigrationColumnActionType.CREATE,
                    {
                      id: v4(),
                      type: FieldMetadataType.TEXT,
                      name: `${phoneFieldMetadata.name}PrimaryPhoneCallingCode`,
                      label: `${phoneFieldMetadata.name}PrimaryPhoneCallingCode`,
                      objectMetadataId: phoneFieldMetadata.object.id,
                      workspaceId: workspaceId,
                      isNullable: true,
                      defaultValue: "''",
                    } satisfies Partial<FieldMetadataEntity>,
                  ),
                } satisfies WorkspaceMigrationTableAction,
              ],
            );
          }
        }

        this.logger.verbose(
          `P1 Step 1 - RUN migration to create callingCodes for ${workspaceId.slice(0, 5)}`,
        );
        await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
          workspaceId,
        );

        await this.workspaceMetadataVersionService.incrementMetadataVersion(
          workspaceId,
        );
      } catch (error) {
        this.logger.log(`Error in workspace ${workspaceId} : ${error}`);
      }
      workspaceIterator++;
    }

    this.logger.log(chalk.green(`Command completed!`));
  }
}
