import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ConnectionCheckService } from 'src/engine/core-modules/application/connection-provider/connection-check.service';
import { ApplicationHealthCheckResultDTO } from 'src/engine/core-modules/application/dtos/application-health-check-result.dto';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ThrottlerGraphqlApiExceptionFilter } from 'src/engine/core-modules/throttler/filters/throttler-graphql-api-exception.filter';
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
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    },
    requiredPermissionFlags: [],
  }),
)
@MetadataResolver()
@UseFilters(
  ApplicationExceptionFilter,
  AuthGraphqlApiExceptionFilter,
  ThrottlerGraphqlApiExceptionFilter,
)
export class ConnectionCheckResolver {
  constructor(
    private readonly connectionCheckService: ConnectionCheckService,
  ) {}

  @Mutation(() => ApplicationHealthCheckResultDTO, { nullable: true })
  async runConnectionCheck(
    @Args('connectedAccountId', { type: () => UUIDScalarType })
    connectedAccountId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUser() { id: userId }: AuthContextUser,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ApplicationHealthCheckResultDTO | null> {
    return this.connectionCheckService.run({
      connectedAccountId,
      workspaceId,
      userId,
      userWorkspaceId,
    });
  }
}
