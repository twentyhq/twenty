import { UseFilters, UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationPreferencesService } from 'src/engine/core-modules/application/application-preferences/application-preferences.service';
import { ApplicationPreferencesDTO } from 'src/engine/core-modules/application/application-preferences/dtos/application-preferences.dto';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

// Every member configures their own values, so no permission is required
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  }),
  NoPermissionGuard,
)
@MetadataResolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class ApplicationPreferencesResolver {
  constructor(
    private readonly applicationPreferencesService: ApplicationPreferencesService,
  ) {}

  @Query(() => [ApplicationPreferencesDTO])
  async myApplicationPreferences(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ApplicationPreferencesDTO[]> {
    return this.applicationPreferencesService.findMyApplicationPreferences({
      workspaceId,
      userWorkspaceId,
    });
  }
}
