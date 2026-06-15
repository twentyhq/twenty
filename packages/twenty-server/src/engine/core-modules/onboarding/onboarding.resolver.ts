import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Mutation, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { InviteSuggestionDTO } from 'src/engine/core-modules/onboarding/dtos/invite-suggestion.dto';
import { OnboardingStepSuccessDTO } from 'src/engine/core-modules/onboarding/dtos/onboarding-step-success.dto';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { getOnboardingInviteSuggestionsCacheKey } from 'src/modules/onboarding-invite-suggestions/constants/onboarding-invite-suggestions.constants';
import { type InviteSuggestion } from 'src/modules/onboarding-invite-suggestions/types/invite-suggestion.type';
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
export class OnboardingResolver {
  constructor(
    private readonly onboardingService: OnboardingService,
    @InjectCacheStorage(CacheStorageNamespace.EngineOnboardingInviteSuggestions)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  // Teammates discovered from the user's freshly connected calendar, used to
  // prefill the invite step. Computed asynchronously on account connection, so
  // this returns an empty list until that background job has populated the
  // cache (the client polls).
  @Query(() => [InviteSuggestionDTO])
  @UseGuards(NoPermissionGuard)
  async getInviteSuggestions(
    @AuthUser() user: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<InviteSuggestionDTO[]> {
    const suggestions = await this.cacheStorageService.get<InviteSuggestion[]>(
      getOnboardingInviteSuggestionsCacheKey(workspace.id, user.id),
    );

    return suggestions ?? [];
  }

  @Mutation(() => OnboardingStepSuccessDTO)
  @UseGuards(NoPermissionGuard)
  async skipSyncEmailOnboardingStep(
    @AuthUser() user: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<OnboardingStepSuccessDTO> {
    await this.onboardingService.setOnboardingConnectAccountPending({
      userId: user.id,
      workspaceId: workspace.id,
      value: false,
    });

    return { success: true };
  }

  @Mutation(() => OnboardingStepSuccessDTO)
  @UseGuards(NoPermissionGuard)
  async skipBookOnboardingStep(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<OnboardingStepSuccessDTO> {
    await this.onboardingService.setOnboardingBookOnboardingPending({
      workspaceId: workspace.id,
      value: false,
    });

    return { success: true };
  }
}
