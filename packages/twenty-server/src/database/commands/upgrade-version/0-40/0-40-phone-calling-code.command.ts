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
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

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
    //      the column name should be `${singularName}PrimaryPhoneCallingCode`
    //      the value should be what was previously in the primary country code
    // 2 - update the primary country code to be one of the counties with this calling code: +33 => FR | +1 => US (if mulitple, select first one)
    // 3 - [IMO, not necessary] if we think it's important, update all additioanl phones to add a country code following the same logic

    // ---------------------------------FieldMetada-----------------------------------------------------------
    // 1 - Add the calling code prop in the field-metadata defaultvalue
    // 2 - [IMO, not necessary : i believe it's always null -> to be checked] Manually add the country code prop in the field-metadata additionalPhones

    this.logger.log(`Part 1 - Workspace`);

    this.logger.log(
      `P1 Step 1 - let's find all the fieldsMetadata that have the PHONES type,
      and extract the objectMetadataId`,
    );
    // 1 get all fields that have PHONES type from field-metadata
    // get the objectmetadaid of this field

    this.logger.log(
      `step 2 - from objectmetadaid, let's find the "nameSingular" of this table`,
    );

    this.logger.log(`step 3 - get the table we want to update`);
    // get await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewWorkspaceEntity>(
    //   workspaceId,
    //   'nameSingular',
    // );

    // migraiton de la default value

    // ------------------------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------------------------

    for (const workspaceId of workspaceIds) {
      this.logger.log(`Running command for workspace ${workspaceId}`);

      const phonesFieldMetadata = await this.fieldMetadataRepository.findOne({
        where: {
          workspaceId,
          type: FieldMetadataType.PHONES,
        },
      });

      this.logger.log(`phonesFieldMetadata ${phonesFieldMetadata?.id}`);

      if (phonesFieldMetadata) {
        const objectMetadataObj = await this.objectMetadataRepository.find({
          where: {
            id: phonesFieldMetadata.objectMetadataId,
          },
        })?.[0];

        this.logger.log(
          `phonesFieldMetadata ${objectMetadataObj?.nameSingular || 'not found'}`,
        );
      }
      // try {
      //   const repository =
      //     await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewWorkspaceEntity>(
      //       workspaceId,
      //       'view',
      //     );

      //   const viewGroupRepository =
      //     await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewGroupWorkspaceEntity>(
      //       workspaceId,
      //       'viewGroup',
      //     );

      //   const kanbanViews = await repository.find({
      //     where: {
      //       type: 'kanban',
      //     },
      //   });

      //   const kanbanFieldMetadataIds = kanbanViews.map(
      //     (view) => view.kanbanFieldMetadataId,
      //   );

      //   const kanbanFieldMetadataItems =
      //     await this.fieldMetadataRepository.find({
      //       where: {
      //         id: In(kanbanFieldMetadataIds),
      //       },
      //     });

      //   for (const kanbanView of kanbanViews) {
      //     const kanbanFieldMetadataItem = kanbanFieldMetadataItems.find(
      //       (item) => item.id === kanbanView.kanbanFieldMetadataId,
      //     );

      //     if (!kanbanFieldMetadataItem) {
      //       this.logger.log(
      //         chalk.red(
      //           `Kanban field metadata with id ${kanbanView.kanbanFieldMetadataId} not found`,
      //         ),
      //       );
      //       continue;
      //     }

      //     for (const option of kanbanFieldMetadataItem.options) {
      //       const viewGroup = await viewGroupRepository.findOne({
      //         where: {
      //           fieldMetadataId: kanbanFieldMetadataItem.id,
      //           fieldValue: option.value,
      //           viewId: kanbanView.id,
      //         },
      //       });

      //       if (viewGroup) {
      //         this.logger.log(
      //           chalk.red(`View group with id ${option.value} already exists`),
      //         );
      //         continue;
      //       }

      //       await viewGroupRepository.save({
      //         fieldMetadataId: kanbanFieldMetadataItem.id,
      //         fieldValue: option.value,
      //         isVisible: true,
      //         viewId: kanbanView.id,
      //         position: option.position,
      //       });
      //     }
      //   }
      // } catch (error) {
      //   this.logger.log(
      //     chalk.red(
      //       `Running command on workspace ${workspaceId} failed with error: ${error}`,
      //     ),
      //   );
      //   continue;
      // } finally {
      //   this.logger.log(
      //     chalk.green(`Finished running command for workspace ${workspaceId}.`),
      //   );
      // }

      this.logger.log(chalk.green(`Command completed!`));
    }
  }
}
