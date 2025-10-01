import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { PublicDomainExceptionFilter } from 'src/engine/core-modules/public-domain/public-domain-exception-filter';
import { PublicDomainService } from 'src/engine/core-modules/public-domain/public-domain.service';
import { PublicDomainDTO } from 'src/engine/core-modules/public-domain/dtos/public-domain.dto';
import { PublicDomainInput } from 'src/engine/core-modules/public-domain/dtos/public-domain.input';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DomainValidRecords } from 'src/engine/core-modules/dns-manager/dtos/domain-valid-records';
import { PublicDomain } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import {
  PublicDomainException,
  PublicDomainExceptionCode,
} from 'src/engine/core-modules/public-domain/public-domain.exception';

@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  PublicDomainExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@Resolver()
export class PublicDomainResolver {
  constructor(
    @InjectRepository(PublicDomain)
    private readonly publicDomainRepository: Repository<PublicDomain>,
    private readonly publicDomainService: PublicDomainService,
    private readonly dnsManagerService: DnsManagerService,
  ) {}

  @Query(() => [PublicDomainDTO])
  async findManyPublicDomains(
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<PublicDomainDTO[]> {
    return await this.publicDomainRepository.find({
      where: { workspaceId: currentWorkspace.id },
    });
  }

  @Mutation(() => PublicDomainDTO)
  async createPublicDomain(
    @Args() { domain }: PublicDomainInput,
    @AuthWorkspace() currentWorkspace: Workspace,
  ): Promise<PublicDomainDTO> {
    return this.publicDomainService.createPublicDomain({
      domain,
      workspace: currentWorkspace,
    });
  }

  @Mutation(() => Boolean)
  async deletePublicDomain(
    @Args() { domain }: PublicDomainInput,
    @AuthWorkspace() currentWorkspace: Workspace,
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
    @AuthWorkspace() workspace: Workspace,
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

    const domainValidRecords =
      await this.dnsManagerService.refreshHostname(workspace);

    return this.publicDomainService.checkPublicDomainValidRecords(
      publicDomain,
      domainValidRecords,
    );
  }
}
