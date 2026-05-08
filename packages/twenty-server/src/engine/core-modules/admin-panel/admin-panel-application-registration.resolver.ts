import { Context, Parent, ResolveField } from '@nestjs/graphql';

import { AdminResolver } from 'src/engine/api/graphql/graphql-config/decorators/admin-resolver.decorator';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';

@AdminResolver(() => ApplicationRegistrationEntity)
export class AdminPanelApplicationRegistrationResolver {
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
