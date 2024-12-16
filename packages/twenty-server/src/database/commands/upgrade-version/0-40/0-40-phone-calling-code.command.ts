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
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
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
  let callingCodeWithoutPlus = callingCode;

  if (callingCode.startsWith('+')) {
    callingCodeWithoutPlus = callingCode.slice(1);
  }

  return (
    getCountries().find(
      (countryCode) =>
        getCountryCallingCode(countryCode) === callingCodeWithoutPlus,
    ) || ''
  );
};

// console.log('33', callingCodeToCountryCode('33'));
// console.log('+33', callingCodeToCountryCode('+33'));
// console.log('', callingCodeToCountryCode(''));
// console.log('FR', callingCodeToCountryCode('FR'));

const isCallingCode = (callingCode: string): boolean => {
  return callingCodeToCountryCode(callingCode) !== '';
};

// console.log('33', isCallingCode('33'));
// console.log('+33', isCallingCode('+33'));
// console.log('', isCallingCode(''));
// console.log('FR', isCallingCode('FR'));

@Command({
  name: 'upgrade-0.40:phone-calling-code',
  description: 'Add calling code and change country code with default one',
})
export class PhoneCallingCodeCommand extends ActiveWorkspacesCommandRunner {
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
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    _options: ActiveWorkspacesCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log(
      'Running command to add calling code and change country code with default one',
    );

    // Prerequisite : the field callingcode was creted in the codebase (PHONES type modification)
    // Note : SyncMetadata will fail since composite field modification is not handled

    // Migration to be applied, in this order :
    // ---------------------------------Workspace-------------------------------------------------------------
    // 1 - Add the calling code field in all the workspaces tables having the PHONES type
    //      the column name should be `${nameSingular}PrimaryPhoneCallingCode`
    // 2 - calling code value should be what was previously in the primary country code
    // 3 - update the primary country code to be one of the counties with this calling code: +33 => FR | +1 => US (if mulitple, select first one)
    // Note: ask Felix if tit's ok for this breaking change TEXT to TEXT. At the same time, should we tranform countrycode en ENUM postgres & graphql ? answer : no need to worry about this breaking change.
    // 4 - [IMO, not necessary] if we think it's important, update all additioanl phones to add a country code following the same logic

    console.log(
      `   Note : other consequesnces to check : zapier @martin + REST api @martin
          Note : other consequesnces to check : timeline activities @coco
    `,
    );
    // ---------------------------------FieldMetada-----------------------------------------------------------
    // 1 - Add the calling code prop in the field-metadata defaultvalue
    // 1bis - cahnge country code prop in the field-metadata defaultvalue cf above +33 => FR
    // Note: no additionalPhgones in the default value

    this.logger.log(`Part 1 - Workspace`);

    // ------------------------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------------------------
    const workspaceIterator = 1;

    for (const workspaceId of workspaceIds) {
      this.logger.log(
        `Running command for workspace ${workspaceId} ${workspaceIterator}/${workspaceIds.length}`,
      );

      this.logger.log(
        `P1 Step 1 - let's find all the fieldsMetadata that have the PHONES type, and extract the objectMetadataId`,
      );

      const phonesFieldMetadata = await this.fieldMetadataRepository.find({
        where: {
          workspaceId,
          type: FieldMetadataType.PHONES,
        },
      });

      this.logger.log(`phonesFieldMetadata: ${phonesFieldMetadata?.length}`);
      for (const phoneFieldMetadata of phonesFieldMetadata) {
        this.logger.log(
          `before loop, phonesFieldMetadata: ${phoneFieldMetadata.name}`,
        );
      }
      for (const phoneFieldMetadata of phonesFieldMetadata) {
        if (
          isDefined(phoneFieldMetadata) &&
          isDefined(phoneFieldMetadata.name)
        ) {
          const [objectMetadata] = await this.objectMetadataRepository.find({
            where: {
              id: phoneFieldMetadata?.objectMetadataId,
            },
          });

          this.logger.log(
            `P1 Step 1 - Let's find the "nameSingular" of this objectMetadata: ${objectMetadata.nameSingular || 'not found'}`,
          );

          if (!objectMetadata || !objectMetadata.nameSingular) break;

          this.logger.log(
            `P1 Step 1 - Create migration for field ${phoneFieldMetadata.name}`,
          );

          await this.workspaceMigrationService.createCustomMigration(
            generateMigrationName(
              `create-${objectMetadata.nameSingular}PrimaryPhoneCallingCode-for-field-${phoneFieldMetadata.name}`,
            ),
            workspaceId,
            [
              {
                name: computeObjectTargetTable(objectMetadata),
                action: WorkspaceMigrationTableActionType.ALTER,
                columns: this.workspaceMigrationFactory.createColumnActions(
                  WorkspaceMigrationColumnActionType.CREATE,
                  {
                    id: v4(),
                    type: FieldMetadataType.TEXT,
                    name: `${phoneFieldMetadata.name}PrimaryPhoneCallingCode`,
                    label: `${phoneFieldMetadata.name}PrimaryPhoneCallingCode`,
                    objectMetadataId: objectMetadata.id,
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

      this.logger.log(
        `P1 Step1 - RUN migration to create callingCodes for ${workspaceId.slice(0, 5)}`,
      );
      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
        workspaceId,
      );

      this.logger.log(
        `P1 Step 2 - Migrations for callingCode creation must be done first because we now use twentyORMGlobalManager to update country codes`,
      );

      this.logger.log(
        `P1 Step 3 (same time) - update primaryCountryCode to be country letters: +33 => FR || +1 => US (if mulitple, first one)`,
      );

      this.logger.log(
        `P1 Step 4 (same time) - update all additioanl phones to add a country code following the same logic`,
      );

      for (const phoneFieldMetadata of phonesFieldMetadata) {
        this.logger.log(`P1 Step 2 - for ${phoneFieldMetadata.name}`);
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

          await Promise.all(
            records.map(async (record) => {
              // this.logger.log( `P1 Step 2 - obj.nameSingular: ${objectMetadata.nameSingular} (objId: ${objectMetadata.id}) - record.id: ${record.id} - phoneFieldMetadata.name: ${phoneFieldMetadata.name}` );
              // this.logger.log(
              //   `P1 Step 3 - obj.nameSingular: ${objectMetadata.nameSingular} (objId: ${objectMetadata.id}) - record.id: ${record.id} - fieldMetadata: ${phoneFieldMetadata.name}  - code : ${record[phoneFieldMetadata.name]?.primaryPhoneCountryCode} `,
              // );
              if (
                record &&
                record[phoneFieldMetadata.name] &&
                record[phoneFieldMetadata.name].primaryPhoneCountryCode &&
                isCallingCode(
                  record[phoneFieldMetadata.name].primaryPhoneCountryCode,
                )
              ) {
                // let's process the additional phones
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

                const res = await repository.update(record.id, {
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
            }),
          );
        }
      }
    }

    this.logger.log(`Part 2 - FieldMetadata`);

    this.logger.log(chalk.green(`Command completed!`));
  }
}
