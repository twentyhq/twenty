import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { PermissionFlagType } from 'twenty-shared/constants';

import { DomainValidRecords } from 'src/engine/core-modules/dns-manager/dtos/domain-valid-records';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { PublicDomainDTO } from 'src/engine/core-modules/public-domain/dtos/public-domain.dto';
import { PublicDomainInput } from 'src/engine/core-modules/public-domain/dtos/public-domain.input';
import { PublicDomainExceptionFilter } from 'src/engine/core-modules/public-domain/public-domain-exception-filter';
import { PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';
import {
  PublicDomainException,
  PublicDomainExceptionCode,
} from 'src/engine/core-modules/public-domain/public-domain.exception';
import { PublicDomainService } from 'src/engine/core-modules/public-domain/public-domain.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKSPACE_MEMBERS),
)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  PublicDomainExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@Resolver()
export class PublicDomainResolver {
  constructor(
    @InjectRepository(PublicDomainEntity)
    private readonly publicDomainRepository: Repository<PublicDomainEntity>,
    private readonly publicDomainService: PublicDomainService,
    private readonly dnsManagerService: DnsManagerService,
  ) {}

  @Query(() => [PublicDomainDTO])
  async findManyPublicDomains(
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<PublicDomainDTO[]> {
    return await this.publicDomainRepository.find({
      where: { workspaceId: currentWorkspace.id },
    });
  }

  @Mutation(() => PublicDomainDTO)
  async createPublicDomain(
    @Args() { domain }: PublicDomainInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<PublicDomainDTO> {
    return this.publicDomainService.createPublicDomain({
      domain,
      workspace: currentWorkspace,
    });
  }

  @Mutation(() => Boolean)
  async deletePublicDomain(
    @Args() { domain }: PublicDomainInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<boolean> {
    await this.publicDomainService.deletePublicDomain({
      domain,
      workspace: currentWorkspace,
    });

    return true;
  }

  @Mutation(() => DomainValidRecords, { nullable: true })
  async checkPublicDomainValidRecords(
    @Args() { domain }: PublicDomainInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<DomainValidRecords | undefined> {
    const publicDomain = await this.publicDomainRepository.findOne({
      where: { workspaceId: workspace.id, domain },
    });

    assertIsDefinedOrThrow(
      publicDomain,
      new PublicDomainException(
        `Public domain ${domain} not found`,
        PublicDomainExceptionCode.PUBLIC_DOMAIN_NOT_FOUND,
      ),
    );

    const domainValidRecords = await this.dnsManagerService.refreshHostname(
      domain,
      {
        isPublicDomain: true,
      },
    );

    return this.publicDomainService.checkPublicDomainValidRecords(
      publicDomain,
      domainValidRecords,
    );
  }
}
