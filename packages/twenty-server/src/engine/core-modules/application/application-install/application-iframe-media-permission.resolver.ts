import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Parent, ResolveField } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationIframeMediaPermissionService } from 'src/engine/core-modules/application/application-install/application-iframe-media-permission.service';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { IframeMediaPermissionInput } from 'src/engine/core-modules/application/dtos/iframe-media-permission.input';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { toIframeMediaPermissions } from 'src/engine/core-modules/application/utils/to-iframe-media-permissions.util';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { IframeMediaPermissionDTO } from 'src/engine/core-modules/workspace/dtos/iframe-media-permission.dto';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';

@MetadataResolver(() => ApplicationDTO)
@UsePipes(ResolverValidationPipe)
@UseFilters(ApplicationExceptionFilter, AuthGraphqlApiExceptionFilter)
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: false,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  }),
  SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
)
export class ApplicationIframeMediaPermissionResolver {
  constructor(
    private readonly applicationIframeMediaPermissionService: ApplicationIframeMediaPermissionService,
    private readonly applicationService: ApplicationService,
  ) {}

  @ResolveField(() => [IframeMediaPermissionDTO])
  async requestedIframeMediaPermissions(
    @Parent() application: Pick<ApplicationDTO, 'id'>,
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ): Promise<IframeMediaPermission[]> {
    const readableApplication = await this.findReadableApplication({
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
  async grantedIframeMediaPermissions(
    @Parent() application: Pick<ApplicationDTO, 'id'>,
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ): Promise<IframeMediaPermission[]> {
    const readableApplication = await this.findReadableApplication({
      applicationId: application.id,
      workspaceId,
      workspaceCustomApplicationId,
      callingApplication,
    });

    return toIframeMediaPermissions(
      readableApplication?.grantedIframeMediaPermissions,
    );
  }

  @Mutation(() => ApplicationDTO)
  approveApplicationIframeMediaPermissions(
    @Args('applicationId', { type: () => UUIDScalarType })
    applicationId: string,
    @Args('approvedIframeMediaPermissions', {
      type: () => [IframeMediaPermissionInput],
    })
    approvedIframeMediaPermissions: IframeMediaPermissionInput[],
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationEntity> {
    return this.applicationIframeMediaPermissionService.approve({
      applicationId,
      workspaceId,
      approvedIframeMediaPermissions,
    });
  }

  private async findReadableApplication({
    applicationId,
    workspaceId,
    workspaceCustomApplicationId,
    callingApplication,
  }: {
    applicationId: string;
    workspaceId: string;
    workspaceCustomApplicationId: string;
    callingApplication: FlatApplication | undefined;
  }): Promise<FlatApplication | undefined> {
    if (
      !canCallerReachApplication({
        applicationId,
        callingApplication,
        operation: 'read',
        workspaceCustomApplicationId,
      })
    ) {
      return undefined;
    }

    return this.applicationService.findInstalledFlatApplication({
      applicationId,
      workspaceId,
    });
  }
}
