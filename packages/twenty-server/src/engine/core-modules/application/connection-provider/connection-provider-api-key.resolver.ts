import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ConnectionProviderApiKeyFlowService } from 'src/engine/core-modules/application/connection-provider/connection-provider-api-key-flow.service';
import { ConnectApplicationWithApiKeyInput } from 'src/engine/core-modules/application/connection-provider/dtos/connect-application-with-api-key.input';
import { ConnectionProviderGraphqlApiExceptionInterceptor } from 'src/engine/core-modules/application/connection-provider/interceptors/connection-provider-graphql-api-exception.interceptor';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

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
export class ConnectionProviderApiKeyResolver {
  constructor(
    private readonly apiKeyFlowService: ConnectionProviderApiKeyFlowService,
  ) {}

  @Mutation(() => UUIDScalarType)
  async connectApplicationWithApiKey(
    @Args('input') input: ConnectApplicationWithApiKeyInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUser() { id: userId }: AuthContextUser,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<string> {
    const { connectedAccountId } = await this.apiKeyFlowService.connect({
      applicationId: input.applicationId,
      providerName: input.providerName,
      apiKey: input.apiKey,
      workspaceId,
      userId,
      userWorkspaceId,
      reconnectingConnectedAccountId:
        input.reconnectingConnectedAccountId ?? null,
    });

    return connectedAccountId;
  }
}
