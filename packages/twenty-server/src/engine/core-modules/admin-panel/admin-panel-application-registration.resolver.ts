import { Context, Int, Parent, ResolveField } from '@nestjs/graphql';

import { AdminResolver } from 'src/engine/api/graphql/graphql-config/decorators/admin-resolver.decorator';
import { ApplicationRegistrationAssetUrlService } from 'src/engine/core-modules/application/application-registration/application-registration-asset-url.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationConfigurationIssue } from 'src/engine/core-modules/application/application-registration/enums/application-registration-configuration-issue.enum';
import { type AdminApplicationRegistrationListItem } from 'src/engine/core-modules/application/application-registration/dtos/paginated-application-registrations.dto';
import { getApplicationAuthorDisplayName } from 'src/engine/core-modules/application/application-registration/utils/get-application-author-display-name.util';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';

@AdminResolver(() => ApplicationRegistrationEntity)
export class AdminPanelApplicationRegistrationResolver {
  constructor(
    private readonly applicationRegistrationAssetUrlService: ApplicationRegistrationAssetUrlService,
  ) {}

  @ResolveField(() => Boolean)
  async isConfigured(
    @Parent()
    registration:
      | ApplicationRegistrationEntity
      | AdminApplicationRegistrationListItem,
    @Context() context: { loaders: IDataloaders },
  ): Promise<boolean> {
    if ('isConfigured' in registration) {
      return registration.isConfigured;
    }

    const configurationIssues =
      await context.loaders.applicationRegistrationConfigurationIssuesLoader.load(
        { applicationRegistrationId: registration.id },
      );

    return configurationIssues.length === 0;
  }

  @ResolveField(() => [ApplicationRegistrationConfigurationIssue])
  async configurationIssues(
    @Parent()
    registration:
      | ApplicationRegistrationEntity
      | AdminApplicationRegistrationListItem,
    @Context() context: { loaders: IDataloaders },
  ): Promise<ApplicationRegistrationConfigurationIssue[]> {
    return context.loaders.applicationRegistrationConfigurationIssuesLoader.load(
      { applicationRegistrationId: registration.id },
    );
  }

  @ResolveField(() => Int)
  async installCount(
    @Parent()
    registration:
      | ApplicationRegistrationEntity
      | AdminApplicationRegistrationListItem,
    @Context() context: { loaders: IDataloaders },
  ): Promise<number> {
    if ('installCount' in registration) {
      return registration.installCount;
    }

    return context.loaders.applicationRegistrationInstallCountLoader.load({
      applicationRegistrationId: registration.id,
    });
  }

  @ResolveField(() => String, { nullable: true })
  author(@Parent() registration: ApplicationRegistrationEntity): string | null {
    return getApplicationAuthorDisplayName(registration.author);
  }

  @ResolveField(() => String, { nullable: true })
  logoUrl(
    @Parent() registration: ApplicationRegistrationEntity,
  ): string | null {
    return this.applicationRegistrationAssetUrlService.buildLogoUrl(
      registration,
    );
  }

  @ResolveField(() => [String])
  galleryImagesUrls(
    @Parent() registration: ApplicationRegistrationEntity,
  ): string[] {
    return this.applicationRegistrationAssetUrlService.buildGalleryImageUrls(
      registration,
    );
  }
}
