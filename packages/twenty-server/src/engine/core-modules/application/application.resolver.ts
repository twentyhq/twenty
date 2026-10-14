import { UseFilters, UseGuards } from '@nestjs/common';
import { Context, Parent, Query, ResolveField } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop/application-stop.service';
import { type ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { ApplicationVariableEntityDTO } from 'src/engine/core-modules/application/application-variable/dtos/application-variable.dto';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { buildPublicAssetLogoUrl } from 'src/engine/core-modules/application/utils/build-public-asset-logo-url.util';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { ForbiddenError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { SdkClientChecksumsDTO } from 'src/engine/core-modules/sdk-client/dtos/sdk-client-checksums.dto';
import { getInstalledSdkMetadataModule } from 'src/engine/core-modules/sdk-client/utils/get-installed-sdk-metadata-module.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';

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
  NoPermissionGuard,
)
@MetadataResolver(() => ApplicationDTO)
@UseFilters(ApplicationExceptionFilter)
export class ApplicationResolver {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationStopService: ApplicationStopService,
    private readonly applicationService: ApplicationService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  @Query(() => SdkClientChecksumsDTO, { nullable: true })
  @UseGuards(ApplicationTargetGuard)
  async applicationSdkClientChecksums(
    @ApplicationTargetArg(
      'applicationId',
      { kind: 'applicationId', requireApplicationRegistrationOwnership: false },
      { type: () => UUIDScalarType },
    )
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

  // Surfaces the kill switch so clients can warn users that the app is
  // temporarily stopped and behaving in a degraded way. Kept as a dedicated
  // query so listing applications does not trigger one Redis read per app.
  @Query(() => Boolean)
  @UseGuards(ApplicationTargetGuard)
  async isApplicationStopped(
    @ApplicationTargetArg('applicationUniversalIdentifier', {
      kind: 'applicationUniversalIdentifier',
      requireApplicationRegistrationOwnership: false,
    })
    applicationUniversalIdentifier: string,
  ): Promise<boolean> {
    return this.applicationStopService.isApplicationStopped(
      applicationUniversalIdentifier,
    );
  }

  @ResolveField(() => String)
  async name(
    @Parent() application: Pick<ApplicationDTO, 'id' | 'name'>,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace({ allowUndefined: true })
    workspace: WorkspaceEntity | undefined,
  ): Promise<string> {
    return this.applicationTranslationCatalogService.resolveManifestMessage({
      entity: 'application',
      property: 'displayName',
      sourceValue: application.name,
      applicationId: application.id,
      loaders: context.loaders,
      locale: context.req.locale,
      workspaceId: workspace?.id,
    });
  }

  @ResolveField(() => String, { nullable: true })
  async description(
    @Parent() application: Pick<ApplicationDTO, 'id' | 'description'>,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace({ allowUndefined: true })
    workspace: WorkspaceEntity | undefined,
  ): Promise<string | undefined> {
    return this.applicationTranslationCatalogService.resolveManifestMessage({
      entity: 'application',
      property: 'description',
      sourceValue: application.description,
      applicationId: application.id,
      loaders: context.loaders,
      locale: context.req.locale,
      workspaceId: workspace?.id,
    });
  }

  // Resolves the display url of the logo bundled in the installed
  // application's public assets, so clients never build file urls themselves.
  @ResolveField(() => String, { nullable: true })
  logoUrl(
    @Parent() application: Pick<ApplicationDTO, 'id' | 'logo'>,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): string | null {
    return buildPublicAssetLogoUrl({
      logo: application.logo,
      serverUrl: this.twentyConfigService.get('SERVER_URL'),
      workspaceId: workspace.id,
      applicationId: application.id,
    });
  }

  @ResolveField(() => Boolean)
  isUninstallBlockedByOtherWorkspaceInstallations(
    @Parent()
    application: Pick<ApplicationDTO, 'id' | 'applicationRegistrationId'>,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    return this.applicationService.isUninstallBlockedByOtherWorkspaceInstallations(
      {
        applicationId: application.id,
        applicationRegistrationId: application.applicationRegistrationId,
        workspaceId: workspace.id,
      },
    );
  }

  @ResolveField(() => [ApplicationVariableEntityDTO])
  applicationVariables(
    @Parent()
    application: Pick<ApplicationDTO, 'id'> & {
      applicationVariables?: ApplicationVariableEntity[];
    },
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ): ApplicationVariableEntity[] | undefined {
    if (
      !canCallerReachApplication({
        callingApplication,
        applicationId: application.id,
      })
    ) {
      throw new ForbiddenError(
        new ApplicationException(
          'An application token can only read its own application variables',
          ApplicationExceptionCode.FORBIDDEN,
        ),
      );
    }

    return application.applicationVariables;
  }
}
