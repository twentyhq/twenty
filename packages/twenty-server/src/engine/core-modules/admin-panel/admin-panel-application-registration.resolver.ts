import { Context, Parent, ResolveField } from '@nestjs/graphql';

import { FileFolder } from 'twenty-shared/types';

import { AdminResolver } from 'src/engine/api/graphql/graphql-config/decorators/admin-resolver.decorator';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { resolveApplicationLogoUrl } from 'src/engine/core-modules/application/utils/resolve-application-logo-url.util';
import { resolveApplicationRegistrationLogoUrl } from 'src/engine/core-modules/application/utils/resolve-application-registration-logo-url.util';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';

@AdminResolver(() => ApplicationRegistrationEntity)
export class AdminPanelApplicationRegistrationResolver {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly fileUrlService: FileUrlService,
    private readonly applicationService: ApplicationService,
  ) {}

  @ResolveField(() => String, { nullable: true })
  async logo(
    @Parent() registration: ApplicationRegistrationEntity,
  ): Promise<string | null> {
    if (
      registration.sourceType === ApplicationRegistrationSourceType.TARBALL &&
      registration.logoFileId
    ) {
      return this.fileUrlService.signFileByIdUrl({
        fileId: registration.logoFileId,
        workspaceId: registration.ownerWorkspaceId ?? '',
        fileFolder: FileFolder.AppTarball,
      });
    }

    const logo =
      registration.logo ?? registration.manifest?.application?.logoUrl ?? null;

    if (
      registration.sourceType === ApplicationRegistrationSourceType.LOCAL &&
      logo &&
      registration.ownerWorkspaceId
    ) {
      const application =
        await this.applicationService.findByUniversalIdentifier({
          universalIdentifier: registration.universalIdentifier,
          workspaceId: registration.ownerWorkspaceId,
        });

      if (application) {
        return resolveApplicationLogoUrl({
          logo,
          serverUrl: this.twentyConfigService.get('SERVER_URL'),
          workspaceId: registration.ownerWorkspaceId,
          applicationId: application.id,
        });
      }
    }

    return resolveApplicationRegistrationLogoUrl({
      logo,
      sourceType: registration.sourceType,
      sourcePackage: registration.sourcePackage,
      latestAvailableVersion: registration.latestAvailableVersion,
      cdnBaseUrl: this.twentyConfigService.get('APP_REGISTRY_CDN_URL'),
    });
  }

  @ResolveField(() => Boolean)
  async isConfigured(
    @Parent() registration: ApplicationRegistrationEntity,
    @Context() context: { loaders: IDataloaders },
  ): Promise<boolean> {
    return context.loaders.isConfiguredLoader.load({
      applicationRegistrationId: registration.id,
    });
  }
}
