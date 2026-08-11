import { Module } from '@nestjs/common';

import { CompanyEnrichmentResolver } from 'src/engine/core-modules/company-enrichment/resolvers/company-enrichment.resolver';
import { CompanyEnrichmentService } from 'src/engine/core-modules/company-enrichment/services/company-enrichment.service';
import { PeopleDataLabsClientService } from 'src/engine/core-modules/company-enrichment/services/people-data-labs-client.service';
import { PersonEnrichmentService } from 'src/engine/core-modules/company-enrichment/services/person-enrichment.service';
import { KeyValuePairModule } from 'src/engine/core-modules/key-value-pair/key-value-pair.module';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';

@Module({
  imports: [
    KeyValuePairModule,
    OnboardingModule,
    SecureHttpClientModule,
    ThrottlerModule,
    UserWorkspaceModule,
  ],
  providers: [
    CompanyEnrichmentResolver,
    CompanyEnrichmentService,
    PeopleDataLabsClientService,
    PersonEnrichmentService,
  ],
  exports: [CompanyEnrichmentService, PersonEnrichmentService],
})
export class CompanyEnrichmentModule {}
