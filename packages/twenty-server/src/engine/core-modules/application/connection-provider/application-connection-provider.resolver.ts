import { UseFilters, UseGuards } from '@nestjs/common';
import { Parent, Query, ResolveField } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import {
  ApplicationConnectionProviderDTO,
  ApplicationConnectionProviderViaDTO,
} from 'src/engine/core-modules/application/connection-provider/dtos/application-connection-provider.dto';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { buildPublicAssetLogoUrl } from 'src/engine/core-modules/application/utils/build-public-asset-logo-url.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

@MetadataResolver(() => ApplicationConnectionProviderDTO)
@UseFilters(ApplicationExceptionFilter)
export class ApplicationConnectionProviderResolver {
  constructor(
    private readonly oauthProviderService: ConnectionProviderService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @Query(() => [ApplicationConnectionProviderDTO])
  @UseGuards(
    AccessPolicyGuard({
      authPrincipals: {
        userSession: {
          standard: true,
          impersonated: true,
          playground: true,
          workspaceAgnostic: false,
        },
        apiKey: true,
        oauthClient: true,
        application: true,
      },
      requiredPermissionFlags: [],
    }),
    ApplicationTargetGuard,
  )
  async applicationConnectionProviders(
    @ApplicationTargetArg(
      'applicationId',
      { kind: 'applicationId', requireApplicationRegistrationOwnership: false },
      { type: () => UUIDScalarType },
    )
    applicationId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApplicationConnectionProviderDTO[]> {
    return this.oauthProviderService.findManyDtosByApplications({
      applicationIds: [applicationId],
      workspaceId: workspace.id,
    });
  }

  @ResolveField(() => String, { nullable: true })
  @UseGuards(NoPermissionGuard)
  logoUrl(
    @Parent()
    connectionProvider: Pick<
      ApplicationConnectionProviderDTO,
      'applicationId' | 'logo'
    >,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): string | null {
    return buildPublicAssetLogoUrl({
      logo: connectionProvider.logo,
      serverUrl: this.twentyConfigService.get('SERVER_URL'),
      workspaceId: workspace.id,
      applicationId: connectionProvider.applicationId,
    });
  }

  @ResolveField(() => ApplicationConnectionProviderViaDTO, { nullable: true })
  @UseGuards(NoPermissionGuard)
  via(
    @Parent()
    connectionProvider: Pick<
      ApplicationConnectionProviderDTO,
      'applicationId' | 'storedVia'
    >,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): ApplicationConnectionProviderViaDTO | null {
    const { storedVia } = connectionProvider;

    if (!isDefined(storedVia)) {
      return null;
    }

    return {
      name: storedVia.name,
      description: storedVia.description,
      url: storedVia.url,
      logoUrl: buildPublicAssetLogoUrl({
        logo: storedVia.logo,
        serverUrl: this.twentyConfigService.get('SERVER_URL'),
        workspaceId: workspace.id,
        applicationId: connectionProvider.applicationId,
      }),
    };
  }
}
