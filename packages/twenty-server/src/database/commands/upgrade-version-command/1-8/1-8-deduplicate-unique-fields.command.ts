import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { IsNull, Not, Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { IndexMetadataService } from 'src/engine/metadata-modules/index-metadata/index-metadata.service';
import { generateDeterministicIndexName } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationIndexAction,
  WorkspaceMigrationIndexActionType,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';

@Command({
  name: 'upgrade:1-8:deduplicate-unique-fields',
  description:
    'Deduplicate unique fields for workspaceMembers, companies and people because we changed the unique constraint',
})
export class DeduplicateUniqueFieldsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(DeduplicateUniqueFieldsCommand.name);
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly dataSourceService: DataSourceService,
    protected readonly indexMetadataService: IndexMetadataService,
    protected readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    protected readonly workspaceMigrationService: WorkspaceMigrationService,
    @InjectRepository(ObjectMetadataEntity)
    protected readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(IndexMetadataEntity)
    protected readonly indexMetadataRepository: Repository<IndexMetadataEntity>,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Deduplicating indexed fields for workspace ${workspaceId}`,
    );
    if (!isDefined(dataSource)) {
      throw new Error(
        'Could not find workspace dataSource, should never occur',
      );
    }

    await this.deduplicateUniqueUserEmailFieldForWorkspaceMembers({
      dataSource,
      dryRun: options.dryRun ?? false,
    });

    await this.deduplicateUniqueDomainNameFieldForCompanies({
      dataSource,
      dryRun: options.dryRun ?? false,
    });

    await this.deduplicateUniqueEmailFieldForPeople({
      dataSource,
      dryRun: options.dryRun ?? false,
    });

    if (!options.dryRun) {
      await this.updateExistingIndexedFields({
        workspaceId,
        objectMetadataNameSingular: 'workspaceMember',
        columnName: 'userEmail',
      });
      await this.updateExistingIndexedFields({
        workspaceId,
        objectMetadataNameSingular: 'company',
        columnName: 'domainNamePrimaryLinkUrl',
      });
      await this.updateExistingIndexedFields({
        workspaceId,
        objectMetadataNameSingular: 'person',
        columnName: 'emailsPrimaryEmail',
      });
    }
  }

  private computeExistingUniqueIndexName({
    objectMetadata,
    fieldMetadataToIndex,
  }: {
    objectMetadata: ObjectMetadataEntity;
    fieldMetadataToIndex: Partial<FieldMetadataEntity>[];
  }) {
    const tableName = computeObjectTargetTable(objectMetadata);
    const columnNames: string[] = fieldMetadataToIndex.map(
      (fieldMetadata) => fieldMetadata.name as string,
    );

    return `IDX_UNIQUE_${generateDeterministicIndexName([tableName, ...columnNames])}`;
  }

  private async computeExistingIndexDeletionMigration({
    objectMetadata,
    fieldMetadataToIndex,
  }: {
    objectMetadata: ObjectMetadataEntity;
    fieldMetadataToIndex: Partial<FieldMetadataEntity>[];
  }) {
    const tableName = computeObjectTargetTable(objectMetadata);

    const indexName = this.computeExistingUniqueIndexName({
      objectMetadata,
      fieldMetadataToIndex,
    });

    return {
      name: tableName,
      action: WorkspaceMigrationTableActionType.ALTER_INDEXES,
      indexes: [
        {
          action: WorkspaceMigrationIndexActionType.DROP,
          name: indexName,
          columns: [],
          isUnique: true,
        } satisfies WorkspaceMigrationIndexAction,
      ],
    } satisfies WorkspaceMigrationTableAction;
  }

  private async updateExistingIndexedFields({
    workspaceId,
    objectMetadataNameSingular,
    columnName,
  }: {
    workspaceId: string;
    objectMetadataNameSingular: string;
    columnName: string;
  }) {
    this.logger.log(
      `Updating existing indexed fields for workspace members for workspace ${workspaceId}`,
    );

    const workspaceMemberObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: objectMetadataNameSingular,
      });

    await this.indexMetadataRepository.delete({
      workspaceId,
      name: this.computeExistingUniqueIndexName({
        objectMetadata: workspaceMemberObjectMetadata,
        fieldMetadataToIndex: [{ name: columnName }],
      }),
    });

    const indexDeletionMigration =
      await this.computeExistingIndexDeletionMigration({
        objectMetadata: workspaceMemberObjectMetadata,
        fieldMetadataToIndex: [{ name: columnName }],
      });

    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`delete-${objectMetadataNameSingular}-index`),
      workspaceId,
      [indexDeletionMigration],
    );

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      workspaceId,
    );
  }

  private async deduplicateUniqueUserEmailFieldForWorkspaceMembers({
    dataSource,
    dryRun,
  }: {
    dataSource: WorkspaceDataSource;
    dryRun: boolean;
  }) {
    const workspaceMemberRepository = dataSource.getRepository(
      'workspaceMember',
      { shouldBypassPermissionChecks: true },
    );

    const duplicates = await workspaceMemberRepository
      .createQueryBuilder('workspaceMember')
      .select('workspaceMember.userEmail', 'userEmail')
      .addSelect('COUNT(*)', 'count')
      .andWhere('workspaceMember.userEmail IS NOT NULL')
      .andWhere("workspaceMember.userEmail != ''")
      .withDeleted()
      .groupBy('workspaceMember.userEmail')
      .having('COUNT(*) > 1')
      .getRawMany();

    for (const duplicate of duplicates) {
      const { userEmail } = duplicate;

      const softDeletedWorkspaceMembers = await workspaceMemberRepository.find({
        where: {
          userEmail,
          deletedAt: Not(IsNull()),
        },
        withDeleted: true,
      });

      for (const [
        i,
        softDeletedWorkspaceMember,
      ] of softDeletedWorkspaceMembers.entries()) {
        const newUserEmail = this.computeNewFieldValues(
          softDeletedWorkspaceMember.userEmail,
          i,
        );

        if (!dryRun) {
          await workspaceMemberRepository
            .createQueryBuilder('workspaceMember')
            .update()
            .set({
              userEmail: newUserEmail,
            })
            .where('id = :id', { id: softDeletedWorkspaceMember.id })
            .execute();
        }
        this.logger.log(
          `Updated workspaceMember ${softDeletedWorkspaceMembers[i].id} userEmail from ${userEmail} to ${newUserEmail}`,
        );
      }
    }
  }

  private async deduplicateUniqueDomainNameFieldForCompanies({
    dataSource,
    dryRun,
  }: {
    dataSource: WorkspaceDataSource;
    dryRun: boolean;
  }) {
    const companyRepository = dataSource.getRepository('company', {
      shouldBypassPermissionChecks: true,
    });

    const duplicates = await companyRepository
      .createQueryBuilder('company')
      .select('company.domainNamePrimaryLinkUrl', 'domainNamePrimaryLinkUrl')
      .addSelect('COUNT(*)', 'count')
      .andWhere('company.domainNamePrimaryLinkUrl IS NOT NULL')
      .andWhere("company.domainNamePrimaryLinkUrl != ''")
      .withDeleted()
      .groupBy('company.domainNamePrimaryLinkUrl')
      .having('COUNT(*) > 1')
      .getRawMany();

    for (const duplicate of duplicates) {
      const { domainNamePrimaryLinkUrl } = duplicate;

      const softDeletedCompanies = await companyRepository.find({
        where: {
          domainName: {
            primaryLinkUrl: domainNamePrimaryLinkUrl,
          },
          deletedAt: Not(IsNull()),
        },
        withDeleted: true,
      });

      for (const [i, softDeletedCompany] of softDeletedCompanies.entries()) {
        const newDomainNamePrimaryLinkUrl = this.computeNewFieldValues(
          softDeletedCompany.domainName.primaryLinkUrl,
          i,
        );

        if (!dryRun) {
          await companyRepository
            .createQueryBuilder('company')
            .update()
            .set({
              domainName: {
                primaryLinkUrl: newDomainNamePrimaryLinkUrl,
              },
            })
            .where('id = :id', { id: softDeletedCompany.id })
            .execute();
        }
        this.logger.log(
          `Updated company ${softDeletedCompany.id} domainNamePrimaryLinkUrl from ${domainNamePrimaryLinkUrl} to ${newDomainNamePrimaryLinkUrl}`,
        );
      }
    }
  }

  private async deduplicateUniqueEmailFieldForPeople({
    dataSource,
    dryRun,
  }: {
    dataSource: WorkspaceDataSource;
    dryRun: boolean;
  }) {
    const personRepository = dataSource.getRepository('person', {
      shouldBypassPermissionChecks: true,
    });

    const duplicates = await personRepository
      .createQueryBuilder('person')
      .select('person.emailsPrimaryEmail', 'emailsPrimaryEmail')
      .addSelect('COUNT(*)', 'count')
      .andWhere('person.emailsPrimaryEmail IS NOT NULL')
      .andWhere("person.emailsPrimaryEmail != ''")
      .withDeleted()
      .groupBy('person.emailsPrimaryEmail')
      .having('COUNT(*) > 1')
      .getRawMany();

    for (const duplicate of duplicates) {
      const { emailsPrimaryEmail } = duplicate;

      const softDeletedPersons = await personRepository.find({
        where: {
          emails: {
            primaryEmail: emailsPrimaryEmail,
          },
          deletedAt: Not(IsNull()),
        },
        withDeleted: true,
      });

      for (const [i, softDeletedPerson] of softDeletedPersons.entries()) {
        const newEmailsPrimaryEmail = this.computeNewFieldValues(
          softDeletedPerson.emails.primaryEmail,
          i,
        );

        if (!dryRun) {
          await personRepository
            .createQueryBuilder('person')
            .update()
            .set({
              emails: {
                primaryEmail: newEmailsPrimaryEmail,
              },
            })
            .where('id = :id', { id: softDeletedPerson.id })
            .execute();
        }
        this.logger.log(
          `Updated person ${softDeletedPerson.id} emailsPrimaryEmail from ${emailsPrimaryEmail} to ${newEmailsPrimaryEmail}`,
        );
      }
    }
  }

  private computeNewFieldValues(fieldValue: string, i: number) {
    return `${fieldValue}-old-${i}`;
  }
}
