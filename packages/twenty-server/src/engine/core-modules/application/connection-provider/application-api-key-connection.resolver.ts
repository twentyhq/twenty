import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Mutation } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ConnectionProviderApiKeyFlowService } from 'src/engine/core-modules/application/connection-provider/connection-provider-api-key-flow.service';
import { ConnectApplicationWithApiKeyInput } from 'src/engine/core-modules/application/connection-provider/dtos/connect-application-with-api-key.input';
import { ConnectionProviderGraphqlApiExceptionInterceptor } from 'src/engine/core-modules/application/connection-provider/interceptors/connection-provider-graphql-api-exception.interceptor';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';

// Connection permissions are checked per provider scope in assertCallerCanConnectOrThrow.
@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: false,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    },
    requiredPermissionFlags: [],
  }),
  ApplicationTargetGuard,
)
@UseInterceptors(ConnectionProviderGraphqlApiExceptionInterceptor)
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@MetadataResolver()
export class ApplicationApiKeyConnectionResolver {
  constructor(
    private readonly apiKeyFlowService: ConnectionProviderApiKeyFlowService,
  ) {}

  @Mutation(() => UUIDScalarType)
  async connectApplicationWithApiKey(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @ApplicationTargetArg<ConnectApplicationWithApiKeyInput>('input', {
      kind: 'applicationId',
      idKey: 'applicationId',
      requireApplicationRegistrationOwnership: false,
    })
    input: ConnectApplicationWithApiKeyInput,
  ): Promise<string> {
    return this.apiKeyFlowService.connect({
      applicationId: input.applicationId,
      providerName: input.providerName,
      apiKey: input.apiKey,
      workspaceId: workspace.id,
      userId: user.id,
      userWorkspaceId,
      reconnectingConnectedAccountId:
        input.reconnectingConnectedAccountId ?? null,
    });
  }
}
