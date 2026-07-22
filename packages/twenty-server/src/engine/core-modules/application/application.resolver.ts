import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField } from '@nestjs/graphql';

import { isAbsoluteUrl, isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { SdkClientChecksumsDTO } from 'src/engine/core-modules/sdk-client/dtos/sdk-client-checksums.dto';
import { getInstalledSdkMetadataModule } from 'src/engine/core-modules/sdk-client/utils/get-installed-sdk-metadata-module.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
@MetadataResolver(() => ApplicationDTO)
export class ApplicationResolver {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  @Query(() => SdkClientChecksumsDTO, { nullable: true })
  async applicationSdkClientChecksums(
    @Args('applicationId', { type: () => UUIDScalarType })
    applicationId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SdkClientChecksumsDTO | null> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspace.id, [
        'flatApplicationMaps',
      ]);

    const application = flatApplicationMaps.byId[applicationId];

    if (!isDefined(application)) {
      return null;
    }

    return {
      core: application.sdkClientCoreChecksum,
      metadata: (await getInstalledSdkMetadataModule()).checksum,
    };
  }

  // Resolves the display url of the logo bundled in the installed
  // application's public assets, so clients never build file urls themselves.
  @ResolveField(() => String, { nullable: true })
  logoUrl(
    @Parent() application: Pick<ApplicationDTO, 'id' | 'logo'>,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): string | null {
    const logo = application.logo;

    if (!isDefined(logo) || logo.length === 0) {
      return null;
    }

    if (isAbsoluteUrl(logo)) {
      return logo;
    }

    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    return `${serverUrl}/public-assets/${workspace.id}/${application.id}/${logo}`;
  }
}
