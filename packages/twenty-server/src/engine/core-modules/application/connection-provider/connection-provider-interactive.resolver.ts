import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { SOURCE_LOCALE, type APP_LOCALES } from 'twenty-shared/translations';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ConnectionProviderInteractiveFlowService } from 'src/engine/core-modules/application/connection-provider/connection-provider-interactive-flow.service';
import { ContinueInteractiveConnectionInput } from 'src/engine/core-modules/application/connection-provider/dtos/continue-interactive-connection.input';
import { InteractiveConnectionAction } from 'src/engine/core-modules/application/connection-provider/dtos/interactive-connection-action.enum';
import { InteractiveConnectionStatus } from 'src/engine/core-modules/application/connection-provider/dtos/interactive-connection-status.enum';
import { InteractiveConnectionStepDTO } from 'src/engine/core-modules/application/connection-provider/dtos/interactive-connection-step.dto';
import { StartInteractiveConnectionInput } from 'src/engine/core-modules/application/connection-provider/dtos/start-interactive-connection.input';
import { ConnectionProviderGraphqlApiExceptionInterceptor } from 'src/engine/core-modules/application/connection-provider/interceptors/connection-provider-graphql-api-exception.interceptor';
import { type InteractiveConnectionStepOutcome } from 'src/engine/core-modules/application/connection-provider/types/interactive-connection-step-outcome.type';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequestLocale } from 'src/engine/decorators/locale/request-locale.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

const STEP_TRIGGER_BY_ACTION = {
  [InteractiveConnectionAction.SUBMIT]: 'submit',
  [InteractiveConnectionAction.POLL]: 'poll',
  [InteractiveConnectionAction.CANCEL]: 'cancel',
} as const;

const toInteractiveConnectionStepDTO = (
  outcome: InteractiveConnectionStepOutcome,
): InteractiveConnectionStepDTO => ({
  status: InteractiveConnectionStatus[outcome.status],
  flowId: outcome.status === 'IN_PROGRESS' ? outcome.flowId : null,
  screen: outcome.status === 'IN_PROGRESS' ? outcome.screen : null,
  connectedAccountId:
    outcome.status === 'CONNECTED' ? outcome.connectedAccountId : null,
});

@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: false,
        playground: false,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    },
    requiredPermissionFlags: [],
  }),
)
@UseInterceptors(ConnectionProviderGraphqlApiExceptionInterceptor)
@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class ConnectionProviderInteractiveResolver {
  constructor(
    private readonly interactiveFlowService: ConnectionProviderInteractiveFlowService,
  ) {}

  @Mutation(() => InteractiveConnectionStepDTO)
  async startInteractiveConnection(
    @Args('input') input: StartInteractiveConnectionInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUser() { id: userId }: AuthContextUser,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
  ): Promise<InteractiveConnectionStepDTO> {
    const outcome = await this.interactiveFlowService.start({
      applicationId: input.applicationId,
      providerName: input.providerName,
      workspaceId,
      userId,
      userWorkspaceId,
      reconnectingConnectedAccountId:
        input.reconnectingConnectedAccountId ?? null,
      locale: locale ?? SOURCE_LOCALE,
    });

    return toInteractiveConnectionStepDTO(outcome);
  }

  @Mutation(() => InteractiveConnectionStepDTO)
  async continueInteractiveConnection(
    @Args('input') input: ContinueInteractiveConnectionInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
  ): Promise<InteractiveConnectionStepDTO> {
    const outcome = await this.interactiveFlowService.continue({
      flowId: input.flowId,
      action: STEP_TRIGGER_BY_ACTION[input.action],
      values: input.values ?? {},
      workspaceId,
      userWorkspaceId,
      locale: locale ?? SOURCE_LOCALE,
    });

    return toInteractiveConnectionStepDTO(outcome);
  }
}
