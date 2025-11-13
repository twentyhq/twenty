import { Module } from '@nestjs/common';

import { DomainServerConfigModule } from 'src/engine/core-modules/domain/domain-server-config/domain-server-config.module';

import { ClientConfigController } from './client-config.controller';

import { ClientConfigService } from './services/client-config.service';

@Module({
  imports: [DomainServerConfigModule],
  controllers: [ClientConfigController],
  providers: [ClientConfigService],
})
export class ClientConfigModule {}
