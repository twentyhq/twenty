import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { PublicDomainService } from 'src/engine/core-modules/public-domain/public-domain.service';
import { PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { PublicDomainResolver } from 'src/engine/core-modules/public-domain/public-domain.resolver';
import { DnsManagerModule } from 'src/engine/core-modules/dns-manager/dns-manager.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CheckPublicDomainsValidRecordsCronCommand } from 'src/engine/core-modules/public-domain/crons/commands/check-public-domains-valid-records.cron.command';
import { CheckPublicDomainsValidRecordsCronJob } from 'src/engine/core-modules/public-domain/crons/jobs/check-public-domains-valid-records.cron.job';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([PublicDomainEntity, WorkspaceEntity]),
    DnsManagerModule,
    PermissionsModule,
  ],
  exports: [CheckPublicDomainsValidRecordsCronCommand, PublicDomainService],
  providers: [
    PublicDomainService,
    PublicDomainResolver,
    CheckPublicDomainsValidRecordsCronCommand,
    CheckPublicDomainsValidRecordsCronJob,
  ],
})
export class PublicDomainModule {}
