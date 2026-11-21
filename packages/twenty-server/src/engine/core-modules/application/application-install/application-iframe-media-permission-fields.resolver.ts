import { UsePipes, UseGuards } from '@nestjs/common';
import { Parent, ResolveField } from '@nestjs/graphql';

import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationIframeMediaPermissionService } from 'src/engine/core-modules/application/application-install/application-iframe-media-permission.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { toIframeMediaPermissions } from 'src/engine/core-modules/application/utils/to-iframe-media-permissions.util';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { IframeMediaPermissionDTO } from 'src/engine/core-modules/workspace/dtos/iframe-media-permission.dto';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

@MetadataResolver(() => ApplicationDTO)
@UsePipes(ResolverValidationPipe)
export class ApplicationIframeMediaPermissionFieldsResolver {
  constructor(
    private readonly applicationIframeMediaPermissionService: ApplicationIframeMediaPermissionService,
    private readonly applicationService: ApplicationService,
  ) {}

  @ResolveField(() => [IframeMediaPermissionDTO])
  @UseGuards(NoPermissionGuard)
  async requestedIframeMediaPermissions(
    @Parent() application: Pick<ApplicationDTO, 'id'>,
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ): Promise<IframeMediaPermission[]> {
    const readableApplication =
      await this.applicationService.findReadableInstalledFlatApplication({
        applicationId: application.id,
        workspaceId,
        workspaceCustomApplicationId,
        callingApplication,
      });

    if (!isDefined(readableApplication)) {
      return [];
    }

    return this.applicationIframeMediaPermissionService.findRequestedPermissions(
      {
        universalIdentifier: readableApplication.universalIdentifier,
        workspaceId,
      },
    );
  }

  @ResolveField(() => [IframeMediaPermissionDTO])
  @UseGuards(NoPermissionGuard)
  async grantedIframeMediaPermissions(
    @Parent() application: Pick<ApplicationDTO, 'id'>,
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ): Promise<IframeMediaPermission[]> {
    const readableApplication =
      await this.applicationService.findReadableInstalledFlatApplication({
        applicationId: application.id,
        workspaceId,
        workspaceCustomApplicationId,
        callingApplication,
      });

    return toIframeMediaPermissions(
      readableApplication?.grantedIframeMediaPermissions,
    );
  }
}
