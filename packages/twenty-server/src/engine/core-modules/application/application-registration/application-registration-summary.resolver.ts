import { Parent, ResolveField } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationRegistrationAssetUrlService } from 'src/engine/core-modules/application/application-registration/application-registration-asset-url.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSummaryDTO } from 'src/engine/core-modules/application/application-registration/dtos/application-registration-summary.dto';
import { getRedirectUriHostnames } from 'src/engine/core-modules/application/application-registration/utils/get-redirect-uri-hostnames.util';

@MetadataResolver(() => ApplicationRegistrationSummaryDTO)
export class ApplicationRegistrationSummaryResolver {
  constructor(
    private readonly applicationRegistrationAssetUrlService: ApplicationRegistrationAssetUrlService,
  ) {}

  @ResolveField(() => String, { nullable: true })
  logoUrl(
    @Parent() registration: ApplicationRegistrationEntity,
  ): string | null {
    return this.applicationRegistrationAssetUrlService.buildLogoUrl(
      registration,
    );
  }

  @ResolveField(() => [String])
  redirectUriHostnames(
    @Parent()
    registration: Pick<ApplicationRegistrationEntity, 'oAuthRedirectUris'>,
  ): string[] {
    return getRedirectUriHostnames(registration.oAuthRedirectUris);
  }
}
