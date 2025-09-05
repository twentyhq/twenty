import { Module } from '@nestjs/common';

import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { CloudflareController } from 'src/engine/core-modules/dns-manager/controllers/cloudflare.controller';

@Module({
  imports: [DomainManagerModule],
  providers: [DnsManagerService],
  controllers: [CloudflareController],
  exports: [DnsManagerService],
})
export class DnsManagerModule {}
