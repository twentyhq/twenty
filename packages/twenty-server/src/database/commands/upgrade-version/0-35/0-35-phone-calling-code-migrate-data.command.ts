import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
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
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationFactory } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.factory';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { isDefined } from 'src/utils/is-defined';

const callingCodeToCountryCode = (callingCode: string): string => {
  if (!callingCode) {
    return '';
  }
  let callingCodeSanitized = callingCode;

  if (callingCode.startsWith('+')) {
    callingCodeSanitized = callingCode.slice(1);
  }

  return (
    getCountries().find(
      (countryCode) =>
        getCountryCallingCode(countryCode) === callingCodeSanitized,
    ) || ''
  );
};

const isCallingCode = (callingCode: string): boolean => {
  return callingCodeToCountryCode(callingCode) !== '';
};

@Command({
  name: 'upgrade-0.35:phone-calling-code-migrate-data',
  description: 'Add calling code and change country code with default one',
})
export class PhoneCallingCodeMigrateDataCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
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
      this.logger.log(
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
            if (!options.dryRun) {
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
                      },
                    ),
                  } satisfies WorkspaceMigrationTableAction,
                ],
              );
            }
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

        this.logger.verbose(
          `P1 Step 2 - Migrations for callingCode must be first. Now can use twentyORMGlobalManager to update countryCode`,
        );

        this.logger.verbose(
          `P1 Step 3 (same time) - update CountryCode to letters: +33 => FR || +1 => US (if mulitple, first one)`,
        );

        this.logger.verbose(
          `P1 Step 4 (same time) - update all additioanl phones to add a country code following the same logic`,
        );

        for (const phoneFieldMetadata of phonesFieldMetadata) {
          this.logger.verbose(`P1 Step 2 - for ${phoneFieldMetadata.name}`);
          if (
            isDefined(phoneFieldMetadata) &&
            isDefined(phoneFieldMetadata.name)
          ) {
            const [objectMetadata] = await this.objectMetadataRepository.find({
              where: {
                id: phoneFieldMetadata?.objectMetadataId,
              },
            });

            const repository =
              await this.twentyORMGlobalManager.getRepositoryForWorkspace(
                workspaceId,
                objectMetadata.nameSingular,
              );
            const records = await repository.find();

            for (const record of records) {
              if (
                record?.[phoneFieldMetadata.name]?.primaryPhoneCountryCode &&
                isCallingCode(
                  record[phoneFieldMetadata.name].primaryPhoneCountryCode,
                )
              ) {
                let additionalPhones = null;

                if (record[phoneFieldMetadata.name].additionalPhones) {
                  additionalPhones = record[
                    phoneFieldMetadata.name
                  ].additionalPhones.map((phone) => {
                    return {
                      ...phone,
                      countryCode: callingCodeToCountryCode(phone.callingCode),
                    };
                  });
                }
                if (!options.dryRun) {
                  await repository.update(record.id, {
                    [`${phoneFieldMetadata.name}PrimaryPhoneCallingCode`]:
                      record[phoneFieldMetadata.name].primaryPhoneCountryCode,
                    [`${phoneFieldMetadata.name}PrimaryPhoneCountryCode`]:
                      callingCodeToCountryCode(
                        record[phoneFieldMetadata.name].primaryPhoneCountryCode,
                      ),
                    [`${phoneFieldMetadata.name}AdditionalPhones`]:
                      additionalPhones,
                  });
                }
              }
            }
          }
        }
      } catch (error) {
        this.logger.log(`Error in workspace ${workspaceId} : ${error}`);
      }
      workspaceIterator++;
    }

    this.logger.verbose(`
      
      Part 2 - FieldMetadata`);

    workspaceIterator = 1;
    for (const workspaceId of workspaceIds) {
      this.logger.log(
        `Running command for workspace ${workspaceId} ${workspaceIterator}/${workspaceIds.length}`,
      );

      this.logger.verbose(
        `P2 Step 1 - let's find all the fieldsMetadata that have the PHONES type, and extract the objectMetadataId`,
      );

      try {
        const phonesFieldMetadata = await this.fieldMetadataRepository.find({
          where: {
            workspaceId,
            type: FieldMetadataType.PHONES,
          },
        });

        for (const phoneFieldMetadata of phonesFieldMetadata) {
          if (
            !isDefined(phoneFieldMetadata) ||
            !isDefined(phoneFieldMetadata.defaultValue)
          )
            continue;
          let defaultValue = phoneFieldMetadata.defaultValue;

          // some cases look like it's an array. let's flatten it (not sure the case is supposed to happen but I saw it in my local db)
          if (Array.isArray(defaultValue) && isDefined(defaultValue[0]))
            defaultValue = phoneFieldMetadata.defaultValue[0];

          if (!isDefined(defaultValue)) continue;
          if (typeof defaultValue !== 'object') continue;
          if (!('primaryPhoneCountryCode' in defaultValue)) continue;
          if (!defaultValue.primaryPhoneCountryCode) continue;

          const primaryPhoneCountryCode = defaultValue.primaryPhoneCountryCode;

          const countryCode = callingCodeToCountryCode(
            primaryPhoneCountryCode.replace(/["']/g, ''),
          );

          if (!options.dryRun) {
            if (!defaultValue.primaryPhoneCallingCode) {
              await this.fieldMetadataRepository.update(phoneFieldMetadata.id, {
                defaultValue: {
                  ...defaultValue,
                  primaryPhoneCountryCode: countryCode
                    ? `'${countryCode}'`
                    : "''",
                  primaryPhoneCallingCode: isCallingCode(
                    primaryPhoneCountryCode.replace(/["']/g, ''),
                  )
                    ? primaryPhoneCountryCode
                    : "''",
                },
              });
            }
          }
        }
      } catch (error) {
        this.logger.log(`Error in workspace ${workspaceId} : ${error}`);
      }
      workspaceIterator++;
    }
    this.logger.log(chalk.green(`Command completed!`));
  }
}
