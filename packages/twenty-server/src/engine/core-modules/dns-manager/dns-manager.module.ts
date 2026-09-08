import { Module } from '@nestjs/common';

import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { ManagedHostnameService } from 'src/engine/core-modules/dns-manager/services/managed-hostname.service';
import { DomainServerConfigModule } from 'src/engine/core-modules/domain/domain-server-config/domain-server-config.module';
@Module({
  imports: [DomainServerConfigModule],
  providers: [DnsManagerService, ManagedHostnameService],
  exports: [DnsManagerService, ManagedHostnameService],
})
export class DnsManagerModule {}
