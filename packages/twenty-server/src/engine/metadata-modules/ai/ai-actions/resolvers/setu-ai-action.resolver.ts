import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { AiActionStateDTO } from 'src/engine/metadata-modules/ai/ai-actions/dtos/ai-action-state.dto';
import { AiInteractionStatesDTO } from 'src/engine/metadata-modules/ai/ai-actions/dtos/ai-interaction-states.dto';
import { AiInteractionStatesInput } from 'src/engine/metadata-modules/ai/ai-actions/dtos/ai-interaction-states.input';
import { CancelAiActionInput } from 'src/engine/metadata-modules/ai/ai-actions/dtos/cancel-ai-action.input';
import { DecideAiActionInput } from 'src/engine/metadata-modules/ai/ai-actions/dtos/decide-ai-action.input';
import { ReviseAiActionInput } from 'src/engine/metadata-modules/ai/ai-actions/dtos/revise-ai-action.input';
import { type SetuAiActionRequestEntity } from 'src/engine/metadata-modules/ai/ai-actions/entities/setu-ai-action-request.entity';
import { SetuAiActionGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/ai-actions/setu-ai-action-graphql-api-exception.interceptor';
import { SetuAiActionActorService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action-actor.service';
import { SetuAiActionService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action.service';
import { SetuAiActionException } from 'src/engine/metadata-modules/ai/ai-actions/setu-ai-action.exception';
import { type SetuAiActionActor } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-actor.type';
import { toSetuAiActionProjection } from 'src/engine/metadata-modules/ai/ai-actions/utils/to-setu-ai-action-projection.util';

// Decisions are authenticated UI operations only; none of these is exposed
// as a model tool. Workspace and actor come from authentication, and ids are
// references, never proof of access.
@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: false,
      playground: false,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  }),
  FeatureFlagGuard,
)
@UseInterceptors(SetuAiActionGraphqlApiExceptionInterceptor)
@UseFilters(
  PreventNestToAutoLogGraphqlErrorsFilter,
  AuthGraphqlApiExceptionFilter,
)
export class SetuAiActionResolver {
  constructor(
    private readonly setuAiActionService: SetuAiActionService,
    private readonly actorService: SetuAiActionActorService,
  ) {}

  @Query(() => AiInteractionStatesDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_SETU_AI_ACTIONS_ENABLED)
  @UseGuards(NoPermissionGuard)
  async aiInteractionStates(
    @Args('input') { actionRequestIds }: AiInteractionStatesInput,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<AiInteractionStatesDTO> {
    const results = await this.setuAiActionService.findProjections({
      actor: { workspaceId: workspace.id, userWorkspaceId },
      actionRequestIds,
    });

    return {
      actions: results.map((result) => ({
        requestedId: result.requestedId,
        isAvailable: result.status === 'available',
        action: result.status === 'available' ? result.action : null,
      })),
    };
  }

  @Mutation(() => AiActionStateDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_SETU_AI_ACTIONS_ENABLED)
  @UseGuards(NoPermissionGuard)
  async decideAiAction(
    @Args('input') input: DecideAiActionInput,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<AiActionStateDTO> {
    const action = await this.setuAiActionService.decide({
      ...input,
      actor: await this.resolveActor(workspace.id, userWorkspaceId),
    });

    return this.toState(input.actionRequestId, action);
  }

  @Mutation(() => AiActionStateDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_SETU_AI_ACTIONS_ENABLED)
  @UseGuards(NoPermissionGuard)
  async cancelAiAction(
    @Args('input') input: CancelAiActionInput,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<AiActionStateDTO> {
    const action = await this.setuAiActionService.cancel({
      ...input,
      actor: await this.resolveActor(workspace.id, userWorkspaceId),
    });

    return this.toState(input.actionRequestId, action);
  }

  @Mutation(() => AiActionStateDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_SETU_AI_ACTIONS_ENABLED)
  @UseGuards(NoPermissionGuard)
  async reviseAiAction(
    @Args('input') input: ReviseAiActionInput,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<AiActionStateDTO> {
    const action = await this.setuAiActionService.revise({
      ...input,
      actor: await this.resolveActor(workspace.id, userWorkspaceId),
    });

    return this.toState(input.actionRequestId, action);
  }

  private async resolveActor(
    workspaceId: string,
    userWorkspaceId: string,
  ): Promise<SetuAiActionActor> {
    const actor = await this.actorService.resolve({
      workspaceId,
      userWorkspaceId,
    });

    if (!isDefined(actor)) {
      throw new SetuAiActionException('Action not available', 'NOT_AVAILABLE');
    }

    return actor;
  }

  private toState(
    requestedId: string,
    action: SetuAiActionRequestEntity,
  ): AiActionStateDTO {
    return {
      requestedId,
      isAvailable: true,
      action: toSetuAiActionProjection(action),
    };
  }
}
