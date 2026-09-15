import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventLogEmitterModule } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.module';
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
    EventLogEmitterModule,
  ],
  providers: [CustomDomainManagerService],
  exports: [CustomDomainManagerService],
})
export class CustomDomainManagerModule {}
