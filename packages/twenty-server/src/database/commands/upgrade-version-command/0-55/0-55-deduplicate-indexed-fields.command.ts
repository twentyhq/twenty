import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { IsNull, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade:0-55:deduplicate-indexed-fields',
  description: 'Deduplicate fields where we want to setup the index back on',
})
export class DeduplicateIndexedFieldsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Deduplicating indexed fields for workspace ${workspaceId}`,
    );

    // searchVector should not be problematic since you cannot duplicate a search vector from what I guess
    // in company, domainName is indexed with decorator @WorkspaceIsUnique()
    // in person, email is indexed with decorator @WorkspaceIsUnique()
    // in message-channel-message-association, the object is indexed with decorator @WorkspaceIndex(['messageChannelId', 'messageId']
    // in view-field, the object is indexed with decorator @WorkspaceIndex(['fieldMetadataId', 'viewId']
    // in view-sort, the object is indexed with decorator @WorkspaceIndex(['viewId', 'fieldMetadataId']

    // not needed since no unique constraint on this one:
    // in oportunity, stage is indexed with decorator @WorkspaceFieldIndex()

    await this.enforceUniqueConstraintsForWorkspace(
      workspaceId,
      options.dryRun ?? false,
    );
  }

  private async enforceUniqueConstraintsForWorkspace(
    workspaceId: string,
    dryRun: boolean,
  ): Promise<void> {
    await this.enforceUniqueCompanyDomainName(workspaceId, dryRun);

    await this.enforceUniquePersonEmail(workspaceId, dryRun);

    await this.enforceUniqueMessageChannelMessageAssociation(
      workspaceId,
      dryRun,
    );

    await this.enforceUniqueViewField(workspaceId, dryRun);

    await this.enforceUniqueViewSort(workspaceId, dryRun);
  }

  private async enforceUniqueCompanyDomainName(
    workspaceId: string,
    dryRun: boolean,
  ): Promise<void> {
    const companyRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'company',
        { shouldBypassPermissionChecks: true },
      );

    const duplicates = await companyRepository
      .createQueryBuilder('company')
      .select('company.domainNamePrimaryLinkUrl')
      .addSelect('COUNT(*)', 'count')
      .where('company.deletedAt IS NULL')
      .andWhere('company.domainNamePrimaryLinkUrl IS NOT NULL')
      .andWhere("company.domainNamePrimaryLinkUrl != ''")
      .groupBy('company.domainNamePrimaryLinkUrl')
      .having('COUNT(*) > 1')
      .getRawMany();

    for (const duplicate of duplicates) {
      const { company_domainNamePrimaryLinkUrl } = duplicate;
      const companies = await companyRepository.find({
        where: {
          domainName: {
            primaryLinkUrl: company_domainNamePrimaryLinkUrl,
          },
          deletedAt: IsNull(),
        },
        order: { createdAt: 'DESC' },
      });

      for (let i = 1; i < companies.length; i++) {
        const newdomainNamePrimaryLinkUrl = `${company_domainNamePrimaryLinkUrl}${i}`;

        if (!dryRun) {
          await companyRepository.update(companies[i].id, {
            domainNamePrimaryLinkUrl: newdomainNamePrimaryLinkUrl,
          });
        }
        this.logger.log(
          `Updated company ${companies[i].id} domainName from ${company_domainNamePrimaryLinkUrl} to ${newdomainNamePrimaryLinkUrl}`,
        );
      }
    }
  }

  private async enforceUniquePersonEmail(
    workspaceId: string,
    dryRun: boolean,
  ): Promise<void> {
    const personRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'person',
        { shouldBypassPermissionChecks: true },
      );

    const duplicates = await personRepository
      .createQueryBuilder('person')
      .select('person.emailsPrimaryEmail')
      .addSelect('COUNT(*)', 'count')
      .where('person.deletedAt IS NULL')
      .andWhere('person.emailsPrimaryEmail IS NOT NULL')
      .andWhere("person.emailsPrimaryEmail != ''")
      .groupBy('person.emailsPrimaryEmail')
      .having('COUNT(*) > 1')
      .getRawMany();

    for (const duplicate of duplicates) {
      const { person_emailsPrimaryEmail } = duplicate;
      const persons = await personRepository.find({
        where: {
          emails: {
            primaryEmail: person_emailsPrimaryEmail,
          },
          deletedAt: IsNull(),
        },
        order: { createdAt: 'DESC' },
      });

      for (let i = 1; i < persons.length; i++) {
        const newEmail = person_emailsPrimaryEmail?.includes('@')
          ? `${person_emailsPrimaryEmail.split('@')[0]}+${i}@${person_emailsPrimaryEmail.split('@')[1]}`
          : `${person_emailsPrimaryEmail}+${i}`;

        if (!dryRun) {
          await personRepository.update(persons[i].id, {
            emailsPrimaryEmail: newEmail,
          });
        }
        this.logger.log(
          `Updated person ${persons[i].id} emailsPrimaryEmail from ${person_emailsPrimaryEmail} to ${newEmail}`,
        );
      }
    }
  }

  private async enforceUniqueMessageChannelMessageAssociation(
    workspaceId: string,
    dryRun: boolean,
  ): Promise<void> {
    const messageChannelMessageAssociationRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'messageChannelMessageAssociation',
      );

    const duplicates = await messageChannelMessageAssociationRepository
      .createQueryBuilder('messageChannelMessageAssociation')
      .select('messageChannelMessageAssociation.messageId')
      .addSelect('messageChannelMessageAssociation.messageChannelId')
      .addSelect('COUNT(*)', 'count')
      .where('messageChannelMessageAssociation.deletedAt IS NULL')
      .groupBy('messageChannelMessageAssociation.messageId')
      .addGroupBy('messageChannelMessageAssociation.messageChannelId')
      .having('COUNT(*) > 1')
      .getRawMany();

    for (const duplicate of duplicates) {
      const {
        messageChannelMessageAssociation_messageId,
        messageChannelMessageAssociation_messageChannelId,
      } = duplicate;
      const messageChannelMessageAssociations =
        await messageChannelMessageAssociationRepository.find({
          where: {
            messageId: messageChannelMessageAssociation_messageId,
            messageChannelId: messageChannelMessageAssociation_messageChannelId,
            deletedAt: IsNull(),
          },
          order: { createdAt: 'DESC' },
        });

      for (let i = 1; i < messageChannelMessageAssociations.length; i++) {
        if (!dryRun) {
          await messageChannelMessageAssociationRepository.delete(
            messageChannelMessageAssociations[i].id,
          );
        }
        this.logger.log(
          `Deleted messageChannelMessageAssociation ${messageChannelMessageAssociations[i].id}`,
        );
      }
    }
  }

  private async enforceUniqueViewField(
    workspaceId: string,
    dryRun: boolean,
  ): Promise<void> {
    const viewFieldRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'viewField',
      );

    const duplicates = await viewFieldRepository
      .createQueryBuilder('viewField')
      .select('viewField.fieldMetadataId')
      .addSelect('viewField.viewId')
      .addSelect('COUNT(*)', 'count')
      .where('viewField.deletedAt IS NULL')
      .groupBy('viewField.fieldMetadataId')
      .addGroupBy('viewField.viewId')
      .having('COUNT(*) > 1')
      .getRawMany();

    for (const duplicate of duplicates) {
      const { viewField_fieldMetadataId, viewField_viewId } = duplicate;
      const viewFields = await viewFieldRepository.find({
        where: {
          fieldMetadataId: viewField_fieldMetadataId,
          viewId: viewField_viewId,
          deletedAt: IsNull(),
        },
        order: { createdAt: 'DESC' },
      });

      for (let i = 1; i < viewFields.length; i++) {
        if (!dryRun) {
          await viewFieldRepository.delete(viewFields[i].id);
        }
        this.logger.log(`Deleted viewField ${viewFields[i].id}`);
      }
    }
  }

  private async enforceUniqueViewSort(
    workspaceId: string,
    dryRun: boolean,
  ): Promise<void> {
    const viewSortRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'viewSort',
      );

    const duplicates = await viewSortRepository
      .createQueryBuilder('viewSort')
      .select('viewSort.viewId')
      .addSelect('viewSort.fieldMetadataId')
      .addSelect('COUNT(*)', 'count')
      .where('viewSort.deletedAt IS NULL')
      .groupBy('viewSort.viewId')
      .addGroupBy('viewSort.fieldMetadataId')
      .having('COUNT(*) > 1')
      .getRawMany();

    for (const duplicate of duplicates) {
      const { viewSort_viewId, viewSort_fieldMetadataId } = duplicate;
      const viewSorts = await viewSortRepository.find({
        where: {
          fieldMetadataId: viewSort_fieldMetadataId,
          viewId: viewSort_viewId,
          deletedAt: IsNull(),
        },
        order: { createdAt: 'DESC' },
      });

      for (let i = 1; i < viewSorts.length; i++) {
        if (!dryRun) {
          await viewSortRepository.delete(viewSorts[i].id);
        }
        this.logger.log(`Deleted viewSort ${viewSorts[i].id}`);
      }
    }
  }
}
