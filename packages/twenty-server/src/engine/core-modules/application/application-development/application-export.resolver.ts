import { UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationDevelopmentService } from 'src/engine/core-modules/application/application-development/application-development.service';
import { ApplicationExportDTO } from 'src/engine/core-modules/application/application-development/dtos/application-export.dto';
import { ExportApplicationInput } from 'src/engine/core-modules/application/application-development/dtos/export-application.input';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationTargetArgs } from 'src/engine/decorators/auth/application-target-args.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
  SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
)
export class ApplicationExportResolver {
  constructor(
    private readonly applicationDevelopmentService: ApplicationDevelopmentService,
  ) {}

  @Query(() => ApplicationExportDTO)
  @UseGuards(ApplicationTargetGuard)
  async exportApplication(
    @ApplicationTargetArgs<ExportApplicationInput>({
      kind: 'applicationUniversalIdentifier',
      idKey: 'universalIdentifier',
      requireApplicationRegistrationOwnership: true,
    })
    { universalIdentifier }: ExportApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationExportDTO> {
    return this.applicationDevelopmentService.exportApplication({
      universalIdentifier,
      workspaceId,
    });
  }
}
