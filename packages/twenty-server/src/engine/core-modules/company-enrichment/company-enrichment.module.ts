import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyEnrichmentResolver } from 'src/engine/core-modules/company-enrichment/resolvers/company-enrichment.resolver';
import { CompanyEnrichmentService } from 'src/engine/core-modules/company-enrichment/services/company-enrichment.service';
import { PeopleDataLabsCompanyClientService } from 'src/engine/core-modules/company-enrichment/services/people-data-labs-company-client.service';
import { KeyValuePairModule } from 'src/engine/core-modules/key-value-pair/key-value-pair.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
    KeyValuePairModule,
    SecureHttpClientModule,
    ThrottlerModule,
  ],
  providers: [
    CompanyEnrichmentResolver,
    CompanyEnrichmentService,
    PeopleDataLabsCompanyClientService,
  ],
  exports: [CompanyEnrichmentService],
})
export class CompanyEnrichmentModule {}
