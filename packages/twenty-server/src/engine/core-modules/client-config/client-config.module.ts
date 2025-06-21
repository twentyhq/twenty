import { Module } from '@nestjs/common';

import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';

import { ClientConfigController } from './client-config.controller';
import { ClientConfigResolver } from './client-config.resolver';

import { ClientConfigService } from './services/client-config.service';

@Module({
  imports: [DomainManagerModule],
  controllers: [ClientConfigController],
  providers: [ClientConfigResolver, ClientConfigService],
})
export class ClientConfigModule {}
