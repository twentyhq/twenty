import { Module } from '@nestjs/common';

import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { DnsCloudflareController } from 'src/engine/core-modules/dns-manager/controllers/dns-cloudflare.controller';

@Module({
  imports: [DomainManagerModule],
  providers: [DnsManagerService],
  controllers: [DnsCloudflareController],
  exports: [DnsManagerService],
})
export class DnsManagerModule {}
