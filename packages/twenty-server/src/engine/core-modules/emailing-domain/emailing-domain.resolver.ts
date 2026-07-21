import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { CreateEmailingDomainInput } from 'src/engine/core-modules/emailing-domain/dtos/create-emailing-domain.input';
import { EmailingDomainDTO } from 'src/engine/core-modules/emailing-domain/dtos/emailing-domain.dto';
import { EmailGroupAccessGraphqlApiExceptionFilter } from 'src/engine/core-modules/emailing-domain/filters/email-group-access-graphql-api-exception.filter';
import { EmailingDomainGraphqlApiExceptionFilter } from 'src/engine/core-modules/emailing-domain/filters/emailing-domain-graphql-api-exception.filter';
import { EmailGroupAccessService } from 'src/engine/core-modules/emailing-domain/services/email-group-access.service';
import { EmailingDomainService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain.service';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(
  WorkspaceAuthGuard,
  FeatureFlagGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
)
@UseFilters(
  EmailGroupAccessGraphqlApiExceptionFilter,
  EmailingDomainGraphqlApiExceptionFilter,
)
@UsePipes(ResolverValidationPipe)
@MetadataResolver(() => EmailingDomainDTO)
export class EmailingDomainResolver {
  constructor(
    private readonly emailingDomainService: EmailingDomainService,
    private readonly emailGroupAccessService: EmailGroupAccessService,
  ) {}

  @Mutation(() => EmailingDomainDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async createEmailingDomain(
    @Args('input') input: CreateEmailingDomainInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<EmailingDomainDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    const emailingDomain =
      await this.emailingDomainService.createEmailingDomain(
        input.domain.trim().toLowerCase(),
        currentWorkspace.id,
      );

    return emailingDomain;
  }

  @Mutation(() => Boolean)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async deleteEmailingDomain(
    @Args('id') id: string,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<boolean> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    await this.emailingDomainService.deleteEmailingDomain(currentWorkspace, id);

    return true;
  }

  @Mutation(() => EmailingDomainDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async verifyEmailingDomain(
    @Args('id') id: string,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<EmailingDomainDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    const emailingDomain =
      await this.emailingDomainService.verifyEmailingDomain(
        currentWorkspace,
        id,
      );

    return emailingDomain;
  }

  @Query(() => [EmailingDomainDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async getEmailingDomains(
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<EmailingDomainDTO[]> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    const emailingDomains =
      await this.emailingDomainService.getEmailingDomains(currentWorkspace);

    return emailingDomains;
  }
}
