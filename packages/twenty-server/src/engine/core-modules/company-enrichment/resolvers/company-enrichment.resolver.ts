import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Mutation } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceCompanyEnrichmentResultDTO } from 'src/engine/core-modules/company-enrichment/dtos/workspace-company-enrichment-result.dto';
import { WorkspaceCompanyEnrichmentOutcome } from 'src/engine/core-modules/company-enrichment/enums/workspace-company-enrichment-outcome.enum';
import { WorkspacePersonEnrichmentOutcome } from 'src/engine/core-modules/company-enrichment/enums/workspace-person-enrichment-outcome.enum';
import { CompanyEnrichmentService } from 'src/engine/core-modules/company-enrichment/services/company-enrichment.service';
import { PersonEnrichmentService } from 'src/engine/core-modules/company-enrichment/services/person-enrichment.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
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
    private readonly personEnrichmentService: PersonEnrichmentService,
    private readonly onboardingService: OnboardingService,
  ) {}

  @Mutation(() => WorkspaceCompanyEnrichmentResultDTO)
  @UseGuards(NoPermissionGuard)
  async enrichWorkspaceCompany(
    @AuthUser() user: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WorkspaceCompanyEnrichmentResultDTO> {
    const [enrichmentResult, personEnrichmentResult] = await Promise.all([
      this.companyEnrichmentService.enrichCompanyForWorkspaceCreator({
        userId: user.id,
        email: user.email,
        workspaceId: workspace.id,
      }),
      this.personEnrichmentService.enrichPersonForWorkspaceCreator({
        userId: user.id,
        email: user.email,
        workspaceId: workspace.id,
      }),
    ]);

    if (enrichmentResult.outcome === 'matched') {
      await this.onboardingService.setOnboardingBookCallPendingIfQualified({
        userId: user.id,
        workspaceId: workspace.id,
        employeeCount: enrichmentResult.enrichment.employeeCount,
      });
    }

    const isBookCallOnboardingStepPending =
      await this.onboardingService.isOnboardingBookCallPending({
        userId: user.id,
        workspaceId: workspace.id,
      });

    return {
      ...enrichmentResult,
      outcome: WorkspaceCompanyEnrichmentOutcome[enrichmentResult.outcome],
      personOutcome:
        WorkspacePersonEnrichmentOutcome[personEnrichmentResult.outcome],
      personEnrichment: personEnrichmentResult.enrichment,
      isBookCallOnboardingStepPending,
    };
  }
}
