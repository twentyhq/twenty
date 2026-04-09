import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { DnsManagerModule } from 'src/engine/core-modules/dns-manager/dns-manager.module';
import { CustomDomainManagerService } from 'src/engine/core-modules/domain/custom-domain-manager/services/custom-domain-manager.service';
import { PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity, PublicDomainEntity]),
    DnsManagerModule,
    BillingModule,
    AuditModule,
  ],
  providers: [CustomDomainManagerService],
  exports: [CustomDomainManagerService],
})
export class CustomDomainManagerModule {}
