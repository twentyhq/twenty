import { Module } from '@nestjs/common';

import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';

@Module({
  imports: [DomainManagerModule],
  providers: [DnsManagerService],
  exports: [DnsManagerService],
})
export class DnsManagerModule {}
