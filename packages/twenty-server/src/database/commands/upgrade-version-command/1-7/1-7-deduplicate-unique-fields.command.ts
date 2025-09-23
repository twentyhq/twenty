import { InjectRepository } from '@nestjs/typeorm';

import { id } from 'date-fns/locale';
import { Command } from 'nest-commander';
import { IsNull, Not, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade:1-6:deduplicate-unique-fields',
  description:
    'Deduplicate unique fields for workspaceMembers, companies and people because we changed the unique constraint',
})
export class DeduplicateUniqueFieldsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace)
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

    await this.deduplicateUniqueUserEmailFieldForWorkspaceMembers(
      workspaceId,
      options.dryRun ?? false,
    );

    await this.deduplicateUniqueDomainNameFieldForCompanies(
      workspaceId,
      options.dryRun ?? false,
    );

    await this.deduplicateUniqueEmailFieldForPeople(
      workspaceId,
      options.dryRun ?? false,
    );
  }

  private async deduplicateUniqueUserEmailFieldForWorkspaceMembers(
    workspaceId: string,
    dryRun: boolean,
  ) {
    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
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

  private async deduplicateUniqueDomainNameFieldForCompanies(
    workspaceId: string,
    dryRun: boolean,
  ) {
    const companyRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'company',
        { shouldBypassPermissionChecks: true },
      );

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

  private async deduplicateUniqueEmailFieldForPeople(
    workspaceId: string,
    dryRun: boolean,
  ) {
    const personRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'person',
        { shouldBypassPermissionChecks: true },
      );

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
          `Updated person ${id} emailsPrimaryEmail from ${emailsPrimaryEmail} to ${newEmailsPrimaryEmail}`,
        );
      }
    }
  }

  private computeNewFieldValues(fieldValue: string, i: number) {
    return `${fieldValue}-old-${i}`;
  }
}
