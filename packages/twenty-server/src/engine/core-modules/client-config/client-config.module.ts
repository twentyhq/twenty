import { Module } from '@nestjs/common';

import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';

import { ClientConfigResolver } from './client-config.resolver';
import { ClientConfigService } from './client-config.service';

@Module({
  imports: [DomainManagerModule],
  providers: [ClientConfigResolver, ClientConfigService],
})
export class ClientConfigModule {}
