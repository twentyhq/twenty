import { Parent, ResolveField } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationRegistrationVersionEntity } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.entity';
import { ApplicationRegistrationVersionService } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.service';

@MetadataResolver(() => ApplicationRegistrationVersionEntity)
export class ApplicationRegistrationVersionResolver {
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
