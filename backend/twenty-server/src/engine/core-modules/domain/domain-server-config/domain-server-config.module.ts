import { Module } from '@nestjs/common';

import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';

@Module({
  imports: [],
  providers: [DomainServerConfigService],
  exports: [DomainServerConfigService],
})
export class DomainServerConfigModule {}
