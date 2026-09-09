import { Module } from '@nestjs/common';

import { AvailableHostnameService } from 'src/engine/core-modules/dns-resolver/services/available-hostname.service';
import { DnsResolverService } from 'src/engine/core-modules/dns-resolver/services/dns-resolver.service';

@Module({
  providers: [DnsResolverService, AvailableHostnameService],
  exports: [DnsResolverService, AvailableHostnameService],
})
export class DnsResolverModule {}
