import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { CloudflareController } from 'src/engine/core-modules/domain-manager/controllers/cloudflare.controller';
import { CheckCustomDomainValidRecordsCronCommand } from 'src/engine/core-modules/domain-manager/crons/commands/check-custom-domain-valid-records.cron.command';
import { CheckCustomDomainValidRecordsCronJob } from 'src/engine/core-modules/domain-manager/crons/jobs/check-custom-domain-valid-records.cron.job';
import { CustomDomainService } from 'src/engine/core-modules/domain-manager/services/custom-domain.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DomainManagerResolver } from 'src/engine/core-modules/domain-manager/domain-manager.resolver';

@Module({
  imports: [AuditModule, TypeOrmModule.forFeature([Workspace], 'core')],
  providers: [
    DomainManagerResolver,
    DomainManagerService,
    CustomDomainService,
    CheckCustomDomainValidRecordsCronJob,
    CheckCustomDomainValidRecordsCronCommand,
  ],
  exports: [
    DomainManagerService,
    CustomDomainService,
    CheckCustomDomainValidRecordsCronCommand,
  ],
  controllers: [CloudflareController],
})
export class DomainManagerModule {}
