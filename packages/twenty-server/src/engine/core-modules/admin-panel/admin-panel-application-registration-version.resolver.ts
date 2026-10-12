import { Parent, ResolveField } from '@nestjs/graphql';

import { AdminResolver } from 'src/engine/api/graphql/graphql-config/decorators/admin-resolver.decorator';
import { ApplicationRegistrationVersionEntity } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.entity';
import { ApplicationRegistrationVersionService } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.service';

@AdminResolver(() => ApplicationRegistrationVersionEntity)
export class AdminPanelApplicationRegistrationVersionResolver {
  constructor(
    private readonly applicationRegistrationVersionService: ApplicationRegistrationVersionService,
  ) {}

  @ResolveField(() => String, { nullable: true })
  artifactDownloadUrl(
    @Parent() version: ApplicationRegistrationVersionEntity,
  ): Promise<string | null> {
    return this.applicationRegistrationVersionService.buildArtifactDownloadUrl(
      version,
    );
  }
}
