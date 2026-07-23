import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Mutation } from '@nestjs/graphql';

import { type WorkspaceCompanyEnrichmentResult } from 'twenty-shared/workspace';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceCompanyEnrichmentResultDTO } from 'src/engine/core-modules/company-enrichment/dtos/workspace-company-enrichment-result.dto';
import { CompanyEnrichmentService } from 'src/engine/core-modules/company-enrichment/services/company-enrichment.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
@MetadataResolver()
export class CompanyEnrichmentResolver {
  constructor(
    private readonly companyEnrichmentService: CompanyEnrichmentService,
  ) {}

  @Mutation(() => WorkspaceCompanyEnrichmentResultDTO)
  @UseGuards(NoPermissionGuard)
  async enrichWorkspaceCompany(
    @AuthUser() user: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WorkspaceCompanyEnrichmentResult> {
    return this.companyEnrichmentService.enrichCompanyForWorkspaceCreator({
      userId: user.id,
      email: user.email,
      workspaceId: workspace.id,
    });
  }
}
