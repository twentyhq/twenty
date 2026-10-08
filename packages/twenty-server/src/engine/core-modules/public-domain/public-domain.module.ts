import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { PublicDomainService } from 'src/engine/core-modules/public-domain/public-domain.service';
import { PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { PublicDomainQueryResolver } from 'src/engine/core-modules/public-domain/public-domain-query.resolver';
import { PublicDomainResolver } from 'src/engine/core-modules/public-domain/public-domain.resolver';
import { DnsManagerModule } from 'src/engine/core-modules/dns-manager/dns-manager.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CheckPublicDomainsValidRecordsCronCommand } from 'src/engine/core-modules/public-domain/crons/commands/check-public-domains-valid-records.cron.command';
import { CheckPublicDomainsValidRecordsCronJob } from 'src/engine/core-modules/public-domain/crons/jobs/check-public-domains-valid-records.cron.job';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';
@Module({
  imports: [
    ApplicationLookupModule,
    ApplicationRegistrationLookupModule,
    TypeOrmModule.forFeature([
      PublicDomainEntity,
      WorkspaceEntity,
      ApplicationEntity,
    ]),
    DnsManagerModule,
    PermissionsModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  exports: [CheckPublicDomainsValidRecordsCronCommand, PublicDomainService],
  providers: [
    PublicDomainService,
    PublicDomainQueryResolver,
    PublicDomainResolver,
    CheckPublicDomainsValidRecordsCronCommand,
    CheckPublicDomainsValidRecordsCronJob,
    provideWorkspaceScopedRepository(PublicDomainEntity),
    provideWorkspaceScopedRepository(ApplicationEntity),
  ],
})
export class PublicDomainModule {}
