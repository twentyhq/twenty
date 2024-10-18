import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, Option } from 'nest-commander';
import { IsNull, Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

interface EnforceUniqueConstraintsCommandOptions
  extends ActiveWorkspacesCommandOptions {
  person?: boolean;
  company?: boolean;
  viewField?: boolean;
  viewSort?: boolean;
}

@Command({
  name: 'upgrade-0.32:enforce-unique-constraints',
  description:
    'Enforce unique constraints on company domainName, person emailsPrimaryEmail, ViewField, and ViewSort',
})
export class EnforceUniqueConstraintsCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository);
  }

  @Option({
    flags: '--person',
    description: 'Enforce unique constraints on person emailsPrimaryEmail',
  })
  parsePerson() {
    return true;
  }

  @Option({
    flags: '--company',
    description: 'Enforce unique constraints on company domainName',
  })
  parseCompany() {
    return true;
  }

  @Option({
    flags: '--view-field',
    description: 'Enforce unique constraints on ViewField',
  })
  parseViewField() {
    return true;
  }

  @Option({
    flags: '--view-sort',
    description: 'Enforce unique constraints on ViewSort',
  })
  parseViewSort() {
    return true;
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    options: EnforceUniqueConstraintsCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log('Running command to enforce unique constraints');

    for (const workspaceId of workspaceIds) {
      this.logger.log(`Running command for workspace ${workspaceId}`);

      try {
        await this.enforceUniqueConstraintsForWorkspace(
          workspaceId,
          options.dryRun ?? false,
          options,
        );

        await this.twentyORMGlobalManager.destroyDataSourceForWorkspace(
          workspaceId,
        );
      } catch (error) {
        this.logger.log(
          chalk.red(
            `Running command on workspace ${workspaceId} failed with error: ${error}, ${error.stack}`,
          ),
        );
        continue;
      } finally {
        this.logger.log(
          chalk.green(`Finished running command for workspace ${workspaceId}.`),
        );
      }
    }

    this.logger.log(chalk.green(`Command completed!`));
  }

  private async enforceUniqueConstraintsForWorkspace(
    workspaceId: string,
    dryRun: boolean,
    options: EnforceUniqueConstraintsCommandOptions,
  ): Promise<void> {
    if (options.company) {
      await this.enforceUniqueCompanyDomainName(workspaceId, dryRun);
    }
    if (options.person) {
      await this.enforceUniquePersonEmail(workspaceId, dryRun);
    }
    if (options.viewField) {
      await this.enforceUniqueViewField(workspaceId, dryRun);
    }
    if (options.viewSort) {
      await this.enforceUniqueViewSort(workspaceId, dryRun);
    }
  }

  private async enforceUniqueCompanyDomainName(
    workspaceId: string,
    dryRun: boolean,
  ): Promise<void> {
    const companyRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'company',
      );

    const duplicates = await companyRepository
      .createQueryBuilder('company')
      .select('company.domainNamePrimaryLinkUrl')
      .addSelect('COUNT(*)', 'count')
      .where('company.deletedAt IS NULL')
      .where('company.domainNamePrimaryLinkUrl IS NOT NULL')
      .where("company.domainNamePrimaryLinkUrl != ''")
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
          chalk.yellow(
            `Updated company ${companies[i].id} domainName from ${company_domainNamePrimaryLinkUrl} to ${newdomainNamePrimaryLinkUrl}`,
          ),
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
      );

    const duplicates = await personRepository
      .createQueryBuilder('person')
      .select('person.emailsPrimaryEmail')
      .addSelect('COUNT(*)', 'count')
      .where('person.deletedAt IS NULL')
      .where('person.emailsPrimaryEmail IS NOT NULL')
      .where("person.emailsPrimaryEmail != ''")
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
          chalk.yellow(
            `Updated person ${persons[i].id} emailsPrimaryEmail from ${person_emailsPrimaryEmail} to ${newEmail}`,
          ),
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
      .select(['viewField.fieldMetadataId', 'viewField.viewId'])
      .addSelect('COUNT(*)', 'count')
      .where('viewField.deletedAt IS NULL')
      .groupBy('viewField.fieldMetadataId, viewField.viewId')
      .having('COUNT(*) > 1')
      .getRawMany();

    for (const duplicate of duplicates) {
      const { fieldMetadataId, viewId } = duplicate;
      const viewFields = await viewFieldRepository.find({
        where: { fieldMetadataId, viewId, deletedAt: IsNull() },
        order: { createdAt: 'DESC' },
      });

      for (let i = 1; i < viewFields.length; i++) {
        if (!dryRun) {
          await viewFieldRepository.softDelete(viewFields[i].id);
        }
        this.logger.log(
          chalk.yellow(
            `Soft deleted duplicate ViewField ${viewFields[i].id} for fieldMetadataId ${fieldMetadataId} and viewId ${viewId}`,
          ),
        );
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
      .select(['viewSort.fieldMetadataId', 'viewSort.viewId'])
      .addSelect('COUNT(*)', 'count')
      .where('viewSort.deletedAt IS NULL')
      .groupBy('viewSort.fieldMetadataId, viewSort.viewId')
      .having('COUNT(*) > 1')
      .getRawMany();

    for (const duplicate of duplicates) {
      const { fieldMetadataId, viewId } = duplicate;
      const viewSorts = await viewSortRepository.find({
        where: { fieldMetadataId, viewId, deletedAt: IsNull() },
        order: { createdAt: 'DESC' },
      });

      for (let i = 1; i < viewSorts.length; i++) {
        if (!dryRun) {
          await viewSortRepository.softDelete(viewSorts[i].id);
        }
        this.logger.log(
          chalk.yellow(
            `Soft deleted duplicate ViewSort ${viewSorts[i].id} for fieldMetadataId ${fieldMetadataId} and viewId ${viewId}`,
          ),
        );
      }
    }
  }
}
