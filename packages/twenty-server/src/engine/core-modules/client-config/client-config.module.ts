import { Module } from '@nestjs/common';

import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';

import { ClientConfigController } from './client-config.controller';

import { ClientConfigService } from './services/client-config.service';

@Module({
  imports: [DomainManagerModule],
  controllers: [ClientConfigController],
  providers: [ClientConfigService],
})
export class ClientConfigModule {}
