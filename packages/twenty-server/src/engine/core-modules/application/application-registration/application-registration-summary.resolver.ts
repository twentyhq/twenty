import { Parent, ResolveField } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationOAuthIdentityService } from 'src/engine/core-modules/application/application-oauth-identity/services/application-oauth-identity.service';
import { ApplicationRegistrationAssetUrlService } from 'src/engine/core-modules/application/application-registration/application-registration-asset-url.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSummaryDTO } from 'src/engine/core-modules/application/application-registration/dtos/application-registration-summary.dto';

@MetadataResolver(() => ApplicationRegistrationSummaryDTO)
export class ApplicationRegistrationSummaryResolver {
  constructor(
    private readonly applicationRegistrationAssetUrlService: ApplicationRegistrationAssetUrlService,
    private readonly applicationOAuthIdentityService: ApplicationOAuthIdentityService,
  ) {}

  @ResolveField(() => String, { nullable: true })
  logoUrl(
    @Parent() registration: ApplicationRegistrationEntity,
  ): string | null {
    return this.applicationRegistrationAssetUrlService.buildLogoUrl(
      registration,
    );
  }

  @ResolveField(() => String, { nullable: true })
  oAuthIdentityUniversalIdentifier(
    @Parent() registration: ApplicationRegistrationEntity,
  ): Promise<string | null> {
    return this.applicationOAuthIdentityService.findOAuthIdentityUniversalIdentifier(
      registration,
    );
  }
}
