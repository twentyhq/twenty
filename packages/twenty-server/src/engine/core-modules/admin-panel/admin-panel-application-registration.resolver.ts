import { Context, Parent, ResolveField } from '@nestjs/graphql';

import { AdminResolver } from 'src/engine/api/graphql/graphql-config/decorators/admin-resolver.decorator';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { resolveApplicationRegistrationLogoUrl } from 'src/engine/core-modules/application/utils/resolve-application-registration-logo-url.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';

@AdminResolver(() => ApplicationRegistrationEntity)
export class AdminPanelApplicationRegistrationResolver {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  @ResolveField(() => String, { nullable: true })
  logo(@Parent() registration: ApplicationRegistrationEntity): string | null {
    return resolveApplicationRegistrationLogoUrl({
      logo: registration.logo,
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
