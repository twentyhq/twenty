import { Context, Int, Parent, ResolveField } from '@nestjs/graphql';

import { AdminResolver } from 'src/engine/api/graphql/graphql-config/decorators/admin-resolver.decorator';
import { ApplicationRegistrationAssetUrlService } from 'src/engine/core-modules/application/application-registration/application-registration-asset-url.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { type ApplicationRegistrationWithConfigurationStatus } from 'src/engine/core-modules/application/application-registration/dtos/paginated-application-registrations.dto';
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
      | ApplicationRegistrationWithConfigurationStatus,
    @Context() context: { loaders: IDataloaders },
  ): Promise<boolean> {
    // The admin list already computed the status to order the page
    if ('isConfigured' in registration) {
      return registration.isConfigured;
    }

    return context.loaders.isConfiguredLoader.load({
      applicationRegistrationId: registration.id,
    });
  }

  @ResolveField(() => Int)
  async installCount(
    @Parent() registration: ApplicationRegistrationEntity,
    @Context() context: { loaders: IDataloaders },
  ): Promise<number> {
    return context.loaders.applicationRegistrationInstallCountLoader.load({
      applicationRegistrationId: registration.id,
    });
  }

  @ResolveField(() => String, { nullable: true })
  author(@Parent() registration: ApplicationRegistrationEntity): string | null {
    return registration.author;
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
