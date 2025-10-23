import { Module } from '@nestjs/common';

import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { DomainServerConfigModule } from 'src/engine/core-modules/domain/domain-server-config/domain-server-config.module';
@Module({
  imports: [DomainServerConfigModule],
  providers: [DnsManagerService],
  exports: [DnsManagerService],
})
export class DnsManagerModule {}
